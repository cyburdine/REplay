import Foundation
import AVFoundation
import MediaToolbox
import Accelerate

/// Taps the AVPlayer audio bus, runs an FFT per buffer, and publishes the
/// resulting frequency-bin magnitudes (0…1) on the main actor.
///
/// `binCount` log-spaced bins are exposed to the UI; smoothing/peak-hold is
/// applied so bars don't twitch frame-to-frame.
final class AudioVisualizerTap: ObservableObject {
    static let binCount = 48
    // 2048-point FFT: bin width ≈ 21 Hz at 44.1 kHz so the lowest log-spaced
    // bars (30–100 Hz) draw from distinct FFT bins instead of all reading bin 1.
    private static let fftSize = 2048
    private static let log2N: vDSP_Length = vDSP_Length(log2(Float(fftSize)))

    /// Smoothed, normalized magnitudes (count == binCount). Updated on main.
    @Published private(set) var magnitudes: [Float] = Array(repeating: 0, count: AudioVisualizerTap.binCount)
    /// Per-bin peak that decays slowly, for "spectrum analyzer" peak caps.
    @Published private(set) var peaks: [Float] = Array(repeating: 0, count: AudioVisualizerTap.binCount)
    /// Aggregate energy (RMS of bins) — drives background pulse.
    @Published private(set) var energy: Float = 0

    private var fftSetup: FFTSetup?
    private var window: [Float]
    private var smoothed: [Float]
    private var peakHold: [Float]
    /// Slow-moving headroom for the whole spectrum. One ceiling — not per-bin —
    /// so the natural amplitude differences between bins are preserved
    /// (otherwise every bar normalizes to its own peak and everything looks
    /// like a flat blob).
    private var globalCeiling: Float = 0.25
    /// Sample rate captured at tap-prepare time. 44.1 kHz is the most common
    /// fallback for consumer media.
    fileprivate var sampleRate: Float = 44_100
    private var lastUpdate: CFTimeInterval = 0

    init() {
        fftSetup = vDSP_create_fftsetup(Self.log2N, FFTRadix(kFFTRadix2))
        window = [Float](repeating: 0, count: Self.fftSize)
        vDSP_hann_window(&window, vDSP_Length(Self.fftSize), Int32(vDSP_HANN_NORM))
        smoothed = [Float](repeating: 0, count: Self.binCount)
        peakHold = [Float](repeating: 0, count: Self.binCount)
    }

    deinit {
        if let setup = fftSetup { vDSP_destroy_fftsetup(setup) }
    }

    /// Builds an `AVAudioMix` whose input parameters install this tap on the
    /// first audio track of `asset`. Returns nil if the asset has no audio.
    func makeAudioMix(for asset: AVAsset) async -> AVAudioMix? {
        guard let track = try? await asset.loadTracks(withMediaType: .audio).first else {
            return nil
        }

        var callbacks = MTAudioProcessingTapCallbacks(
            version: kMTAudioProcessingTapCallbacksVersion_0,
            clientInfo: Unmanaged.passUnretained(self).toOpaque(),
            init: tapInit,
            finalize: tapFinalize,
            prepare: tapPrepare,
            unprepare: tapUnprepare,
            process: tapProcess
        )

        var tap: MTAudioProcessingTap?
        let status = MTAudioProcessingTapCreate(
            kCFAllocatorDefault,
            &callbacks,
            kMTAudioProcessingTapCreationFlag_PostEffects,
            &tap
        )
        guard status == noErr, let tap else { return nil }

        let params = AVMutableAudioMixInputParameters(track: track)
        params.audioTapProcessor = tap

        let mix = AVMutableAudioMix()
        mix.inputParameters = [params]
        return mix
    }

    // MARK: - DSP

    fileprivate func processBuffer(_ samples: UnsafePointer<Float>, frameCount: Int, channelCount: Int) {
        let n = Self.fftSize
        guard frameCount >= 64 else { return }

        // Mix to mono (or take channel 0) into a working buffer of size n.
        var mono = [Float](repeating: 0, count: n)
        let usable = min(frameCount, n)
        if channelCount == 1 {
            mono.withUnsafeMutableBufferPointer { buf in
                buf.baseAddress!.update(from: samples, count: usable)
            }
        } else {
            // Interleaved: average all channels for each frame.
            let scale: Float = 1.0 / Float(channelCount)
            for c in 0..<channelCount {
                var src = samples.advanced(by: c)
                for i in 0..<usable {
                    mono[i] += src.pointee * scale
                    src = src.advanced(by: channelCount)
                }
            }
        }

        // Window.
        vDSP_vmul(mono, 1, window, 1, &mono, 1, vDSP_Length(n))

        // Real FFT via split-complex.
        var realp = [Float](repeating: 0, count: n / 2)
        var imagp = [Float](repeating: 0, count: n / 2)

        realp.withUnsafeMutableBufferPointer { realPtr in
            imagp.withUnsafeMutableBufferPointer { imagPtr in
                var split = DSPSplitComplex(realp: realPtr.baseAddress!, imagp: imagPtr.baseAddress!)
                mono.withUnsafeBufferPointer { monoPtr in
                    monoPtr.baseAddress!.withMemoryRebound(to: DSPComplex.self, capacity: n / 2) { typed in
                        vDSP_ctoz(typed, 2, &split, 1, vDSP_Length(n / 2))
                    }
                }
                vDSP_fft_zrip(fftSetup!, &split, 1, Self.log2N, FFTDirection(FFT_FORWARD))

                // Magnitudes.
                var mags = [Float](repeating: 0, count: n / 2)
                vDSP_zvmags(&split, 1, &mags, 1, vDSP_Length(n / 2))
                var scale: Float = 1.0 / Float(n)
                vDSP_vsmul(mags, 1, &scale, &mags, 1, vDSP_Length(n / 2))

                // Convert to dB-ish (log scale) and bin logarithmically.
                let bins = logBin(magnitudes: mags)
                publish(bins)
            }
        }
    }

    private func logBin(magnitudes: [Float]) -> [Float] {
        let count = AudioVisualizerTap.binCount
        let total = magnitudes.count                // n/2

        // Map bars logarithmically across an audible band so bin widths grow
        // with frequency (musical octaves are visually equal).
        let binHz = sampleRate / Float(Self.fftSize)
        let minF: Float = 30
        let maxF: Float = min(18_000, sampleRate * 0.5 - binHz)
        let logMin = logf(minF)
        let logMax = logf(maxF)

        var out = [Float](repeating: 0, count: count)
        for i in 0..<count {
            let t0 = Float(i) / Float(count)
            let t1 = Float(i + 1) / Float(count)
            let f0 = expf(logMin + (logMax - logMin) * t0)
            let f1 = expf(logMin + (logMax - logMin) * t1)
            let i0 = max(1, Int(f0 / binHz))
            let i1 = max(i0 + 1, Int(f1 / binHz))
            let hi = min(i1, total)
            guard i0 < hi else { continue }

            // Use the peak within the band (perceptually punchier than mean).
            var bandMax: Float = 0
            for j in i0..<hi where magnitudes[j] > bandMax { bandMax = magnitudes[j] }

            // Pink-noise compensation: real music drops ~3 dB/octave. Multiply
            // by sqrt(f/f_ref) so highs aren't crushed by bass.
            let centerF = (f0 + f1) * 0.5
            let tilt = sqrtf(centerF / minF)
            let weighted = bandMax * tilt

            // Convert to dB and map a useful dynamic range to [0,1].
            let db = 20 * log10f(weighted + 1e-9)
            let dbMin: Float = -55
            let dbMax: Float = -5
            let norm = (db - dbMin) / (dbMax - dbMin)
            out[i] = max(0, min(1, norm))
        }
        return out
    }

    private func publish(_ bins: [Float]) {
        // Global AGC: one ceiling for the whole spectrum so loud bins stay
        // loud relative to quiet ones — preserving the music's natural shape.
        var bufferMax: Float = 0
        for v in bins where v > bufferMax { bufferMax = v }
        if bufferMax > globalCeiling {
            globalCeiling = bufferMax
        } else {
            globalCeiling = max(0.05, globalCeiling * 0.999)
        }

        var sumSq: Float = 0
        for i in 0..<smoothed.count {
            let normalized = min(1, bins[i] / max(globalCeiling, 0.0001))

            // Faster decay so transients pop instead of melting together.
            let target = normalized
            if target > smoothed[i] {
                smoothed[i] = target
            } else {
                smoothed[i] = smoothed[i] * 0.68 + target * 0.32
            }
            // Peak hold: clamps up instantly, decays slowly.
            if smoothed[i] > peakHold[i] {
                peakHold[i] = smoothed[i]
            } else {
                peakHold[i] = max(smoothed[i], peakHold[i] - 0.008)
            }
            sumSq += smoothed[i] * smoothed[i]
        }
        let rms = sqrtf(sumSq / Float(smoothed.count))

        // Throttle UI updates to ~30 Hz (Canvas interpolates between frames).
        let now = CACurrentMediaTime()
        guard now - lastUpdate > 1.0 / 30.0 else { return }
        lastUpdate = now

        let magsSnapshot = smoothed
        let peaksSnapshot = peakHold
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            self.magnitudes = magsSnapshot
            self.peaks = peaksSnapshot
            self.energy = rms
        }
    }

    /// Called when playback stops so the bars decay to zero.
    func reset() {
        smoothed = [Float](repeating: 0, count: AudioVisualizerTap.binCount)
        peakHold = [Float](repeating: 0, count: AudioVisualizerTap.binCount)
        globalCeiling = 0.25
        DispatchQueue.main.async { [weak self] in
            self?.magnitudes = Array(repeating: 0, count: AudioVisualizerTap.binCount)
            self?.peaks = Array(repeating: 0, count: AudioVisualizerTap.binCount)
            self?.energy = 0
        }
    }
}

// MARK: - C callbacks

private let tapInit: MTAudioProcessingTapInitCallback = { _, clientInfo, tapStorageOut in
    tapStorageOut.pointee = clientInfo
}

private let tapFinalize: MTAudioProcessingTapFinalizeCallback = { _ in }

private let tapPrepare: MTAudioProcessingTapPrepareCallback = { tap, _, processingFormat in
    let storage = MTAudioProcessingTapGetStorage(tap)
    let visualizer = Unmanaged<AudioVisualizerTap>.fromOpaque(storage).takeUnretainedValue()
    visualizer.sampleRate = Float(processingFormat.pointee.mSampleRate)
}

private let tapUnprepare: MTAudioProcessingTapUnprepareCallback = { _ in }

private let tapProcess: MTAudioProcessingTapProcessCallback = {
    tap, numberFrames, flags, bufferListInOut, numberFramesOut, flagsOut in

    let status = MTAudioProcessingTapGetSourceAudio(
        tap, numberFrames, bufferListInOut, flagsOut, nil, numberFramesOut
    )
    guard status == noErr else { return }

    let storage = MTAudioProcessingTapGetStorage(tap)
    let visualizer = Unmanaged<AudioVisualizerTap>.fromOpaque(storage).takeUnretainedValue()

    let abl = UnsafeMutableAudioBufferListPointer(bufferListInOut)
    guard let first = abl.first, let data = first.mData else { return }
    let channels = Int(first.mNumberChannels)
    let frames = Int(numberFramesOut.pointee)
    let samples = data.assumingMemoryBound(to: Float.self)
    visualizer.processBuffer(samples, frameCount: frames, channelCount: channels)
}
