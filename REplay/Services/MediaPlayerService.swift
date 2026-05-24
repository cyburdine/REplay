import Foundation
import AVFoundation
import Combine

final class MediaPlayerService: ObservableObject {
    @Published private(set) var player: AVPlayer
    @Published private(set) var isPlaying: Bool = false
    @Published private(set) var currentTime: TimeInterval = 0
    @Published private(set) var duration: TimeInterval = 0
    @Published private(set) var hasVideo: Bool = false
    @Published var volume: Float = 1.0 {
        didSet { player.volume = volume }
    }
    @Published var isMuted: Bool = false {
        didSet { player.isMuted = isMuted }
    }
    @Published var rate: Float = 1.0 {
        didSet { if isPlaying { player.rate = rate } }
    }

    /// Emits when the active item finishes playback naturally.
    let didFinish = PassthroughSubject<Void, Never>()

    /// Live audio FFT data for the visualizer. Installed on every loaded item.
    let visualizerTap = AudioVisualizerTap()

    private var timeObserverToken: Any?
    private var statusObserver: NSKeyValueObservation?
    private var rateObserver: NSKeyValueObservation?
    private var endObserver: NSObjectProtocol?
    private var currentItem: AVPlayerItem?
    private var currentURL: URL?
    private var didStartSecurityScope = false

    init() {
        self.player = AVPlayer()
        self.player.volume = volume
        self.player.allowsExternalPlayback = true
        setupTimeObserver()
        setupRateObserver()
    }

    deinit {
        if let token = timeObserverToken { player.removeTimeObserver(token) }
        statusObserver?.invalidate()
        rateObserver?.invalidate()
        if let obs = endObserver { NotificationCenter.default.removeObserver(obs) }
        stopSecurityScope()
    }

    // MARK: - Loading

    func load(_ url: URL, autoplay: Bool = true, startAt position: TimeInterval = 0) {
        stopSecurityScope()
        didStartSecurityScope = url.startAccessingSecurityScopedResource()
        currentURL = url

        let asset = AVURLAsset(url: url)
        let item = AVPlayerItem(asset: asset)
        currentItem = item

        if let obs = endObserver { NotificationCenter.default.removeObserver(obs) }
        endObserver = NotificationCenter.default.addObserver(
            forName: .AVPlayerItemDidPlayToEndTime,
            object: item,
            queue: .main
        ) { [weak self] _ in
            self?.isPlaying = false
            self?.didFinish.send()
        }

        statusObserver?.invalidate()
        statusObserver = item.observe(\.status, options: [.new, .initial]) { [weak self] item, _ in
            guard let self else { return }
            if item.status == .readyToPlay {
                self.refreshAssetMetadata(asset: asset, item: item)
                if position > 0 {
                    item.seek(to: CMTime(seconds: position, preferredTimescale: 600), completionHandler: nil)
                }
                if autoplay { self.play() }
            }
        }

        // Install the visualizer audio tap on this item's first audio track.
        // Loaded asynchronously; the player can begin before the tap is attached.
        Task { @MainActor [weak self, weak item] in
            guard let self, let item else { return }
            if let mix = await self.visualizerTap.makeAudioMix(for: asset) {
                item.audioMix = mix
            }
        }
        visualizerTap.reset()

        player.replaceCurrentItem(with: item)
    }

    private func refreshAssetMetadata(asset: AVAsset, item: AVPlayerItem) {
        Task { @MainActor in
            if let dur = try? await asset.load(.duration) {
                self.duration = CMTimeGetSeconds(dur).isFinite ? CMTimeGetSeconds(dur) : 0
            }
            if let tracks = try? await asset.loadTracks(withMediaType: .video) {
                self.hasVideo = !tracks.isEmpty
            } else {
                self.hasVideo = false
            }
        }
    }

    // MARK: - Transport

    func play() {
        guard player.currentItem != nil else { return }
        player.rate = rate
        isPlaying = true
    }

    func pause() {
        player.pause()
        isPlaying = false
        visualizerTap.reset()
    }

    func togglePlayPause() {
        isPlaying ? pause() : play()
    }

    func stop() {
        player.pause()
        player.seek(to: .zero)
        isPlaying = false
    }

    func seek(to seconds: TimeInterval) {
        let time = CMTime(seconds: max(0, seconds), preferredTimescale: 600)
        player.seek(to: time, toleranceBefore: .zero, toleranceAfter: .zero)
    }

    func skip(by seconds: TimeInterval) {
        seek(to: currentTime + seconds)
    }

    /// Step exactly one frame in the indicated direction while paused.
    /// For audio (no video tracks), falls back to a 1/30-second nudge.
    func stepFrame(forward: Bool) {
        guard !isPlaying, let item = player.currentItem else { return }
        if hasVideo {
            item.step(byCount: forward ? 1 : -1)
        } else {
            let delta = (forward ? 1.0 : -1.0) / 30.0
            seek(to: currentTime + delta)
        }
    }

    // MARK: - Observers

    private func setupTimeObserver() {
        let interval = CMTime(seconds: 0.1, preferredTimescale: 600)
        timeObserverToken = player.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] t in
            guard let self else { return }
            let secs = CMTimeGetSeconds(t)
            if secs.isFinite { self.currentTime = secs }
        }
    }

    private func setupRateObserver() {
        rateObserver = player.observe(\.rate, options: [.new]) { [weak self] p, _ in
            guard let self else { return }
            // Trust intent (`isPlaying`) over transient rate dips during seeks.
            if p.rate == 0 && self.isPlaying {
                // System paused us (e.g. interruption). Reflect that.
                self.isPlaying = false
            }
        }
    }

    private func stopSecurityScope() {
        if didStartSecurityScope, let url = currentURL {
            url.stopAccessingSecurityScopedResource()
        }
        didStartSecurityScope = false
        currentURL = nil
    }
}
