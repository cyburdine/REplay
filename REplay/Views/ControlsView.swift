import SwiftUI
import AppKit

struct ControlsView: View {
    @ObservedObject var viewModel: PlayerViewModel
    @State private var isScrubbing = false
    @State private var scrubValue: Double = 0

    var body: some View {
        HStack(spacing: 14) {
            secondaryButton(symbol: "shuffle",
                            active: viewModel.playlist.shuffle,
                            help: "Shuffle (⌘S)") { viewModel.toggleShuffle() }

            secondaryButton(symbol: "backward.fill", help: "Previous (⌘←)") { viewModel.previous() }

            playButton

            secondaryButton(symbol: "forward.fill", help: "Next (⌘→)") { viewModel.next() }

            secondaryButton(symbol: viewModel.playlist.loop.symbolName,
                            active: viewModel.playlist.loop != .off,
                            help: viewModel.playlist.loop.label + " (⌘R)") { viewModel.cycleLoop() }

            timeLabel(viewModel.media.currentTime, align: .trailing)
            scrubber
            timeLabel(viewModel.media.duration, align: .leading)

            volumeControl
            speedMenu
            fullscreenButton
        }
        .padding(.horizontal, 22)
        .frame(height: 72)
        .background(controlsBackground)
        .overlay(
            Rectangle()
                .fill(Color.white.opacity(0.07))
                .frame(height: 1),
            alignment: .top
        )
    }

    // MARK: - Surface

    private var controlsBackground: some View {
        ZStack {
            // Vibrancy under the gradient so blurred app windows still feel native.
            Rectangle().fill(.ultraThinMaterial)
            LinearGradient(
                colors: [
                    Color.white.opacity(0.04),
                    Color.black.opacity(0.40)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
        }
    }

    // MARK: - Play button (large white circle)

    private var playButton: some View {
        Button { viewModel.playPause() } label: {
            ZStack {
                Circle()
                    .fill(Color.white)
                    .frame(width: 38, height: 38)
                Image(systemName: viewModel.media.isPlaying ? "pause.fill" : "play.fill")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Color(red: 0.04, green: 0.04, blue: 0.04))
                    .offset(x: viewModel.media.isPlaying ? 0 : 1)  // optical center on play glyph
            }
            .contentShape(Circle())
        }
        .buttonStyle(.plain)
        .help("Play / Pause (Space)")
    }

    // MARK: - Secondary circular button

    private func secondaryButton(symbol: String,
                                 active: Bool = false,
                                 help: String,
                                 action: @escaping () -> Void) -> some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(Color.white.opacity(0.10))
                    .frame(width: 30, height: 30)
                    .overlay(Circle().stroke(Color.white.opacity(0.15), lineWidth: 1))
                Image(systemName: symbol)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(active
                                     ? Color(red: 0.66, green: 0.88, blue: 1.0)
                                     : Color.white.opacity(0.9))
            }
            .contentShape(Circle())
        }
        .buttonStyle(.plain)
        .help(help)
    }

    // MARK: - Scrubber (glowing thin progress)

    private var scrubber: some View {
        AuroraScrubber(
            value: Binding(
                get: { isScrubbing ? scrubValue : viewModel.media.currentTime },
                set: { scrubValue = $0 }
            ),
            range: 0...max(viewModel.media.duration, 0.001),
            onBegin: {
                scrubValue = viewModel.media.currentTime
                isScrubbing = true
            },
            onEnd: { v in
                viewModel.media.seek(to: v)
                isScrubbing = false
            }
        )
        .frame(maxWidth: .infinity)
    }

    private func timeLabel(_ seconds: TimeInterval, align: HorizontalAlignment) -> some View {
        Text(format(seconds))
            .monospacedDigit()
            .font(.system(size: 11))
            .foregroundStyle(Color.white.opacity(0.6))
            .frame(width: 38, alignment: align == .trailing ? .trailing : .leading)
    }

    // MARK: - Volume

    private var volumeControl: some View {
        HStack(spacing: 8) {
            Button { viewModel.toggleMute() } label: {
                Image(systemName: volumeSymbol)
                    .font(.system(size: 13))
                    .foregroundStyle(Color.white.opacity(0.55))
                    .frame(width: 18, alignment: .center)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .help("Mute (M)")

            AuroraVolumeBar(value: Binding(
                get: { viewModel.media.volume },
                set: { viewModel.media.volume = $0 }
            ))
            .frame(width: 64, height: 16)
        }
    }

    private var volumeSymbol: String {
        if viewModel.media.isMuted || viewModel.media.volume == 0 { return "speaker.slash.fill" }
        if viewModel.media.volume < 0.33 { return "speaker.wave.1.fill" }
        if viewModel.media.volume < 0.66 { return "speaker.wave.2.fill" }
        return "speaker.wave.3.fill"
    }

    // MARK: - Speed

    private var speedMenu: some View {
        Menu {
            ForEach(PlayerViewModel.speeds, id: \.self) { speed in
                Button {
                    viewModel.setRate(speed)
                } label: {
                    HStack {
                        Text(speedLabel(speed))
                        if viewModel.media.rate == speed { Image(systemName: "checkmark") }
                    }
                }
            }
        } label: {
            Text(speedLabel(viewModel.media.rate))
                .font(.system(size: 11, weight: .medium))
                .monospacedDigit()
                .foregroundStyle(Color.white.opacity(0.7))
                .padding(.horizontal, 6)
        }
        .menuStyle(.borderlessButton)
        .fixedSize()
        .frame(width: 56)
        .help("Playback Speed")
    }

    private func speedLabel(_ s: Float) -> String {
        s.truncatingRemainder(dividingBy: 1) == 0
        ? String(format: "%.0fx", s)
        : String(format: "%.2gx", s)
    }

    // MARK: - Fullscreen

    private var fullscreenButton: some View {
        Button { viewModel.toggleFullScreen() } label: {
            Image(systemName: isFullscreen
                  ? "arrow.down.right.and.arrow.up.left"
                  : "arrow.up.left.and.arrow.down.right")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(Color.white.opacity(0.7))
                .frame(width: 24, height: 24)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .help("Toggle Fullscreen (⌃⌘F · Esc to exit)")
    }

    private var isFullscreen: Bool {
        NSApp.keyWindow?.styleMask.contains(.fullScreen) ?? false
    }

    // MARK: - Helpers

    private func format(_ seconds: TimeInterval) -> String {
        guard seconds.isFinite, seconds >= 0 else { return "0:00" }
        let total = Int(seconds)
        let h = total / 3600
        let m = (total % 3600) / 60
        let s = total % 60
        return h > 0
        ? String(format: "%d:%02d:%02d", h, m, s)
        : String(format: "%d:%02d", m, s)
    }
}

// MARK: - Aurora-styled scrubber

private struct AuroraScrubber: View {
    @Binding var value: Double
    let range: ClosedRange<Double>
    let onBegin: () -> Void
    let onEnd: (Double) -> Void

    @State private var dragging = false

    var body: some View {
        GeometryReader { geo in
            let total = max(range.upperBound - range.lowerBound, 0.001)
            let progress = max(0, min(1, (value - range.lowerBound) / total))
            let width = geo.size.width
            let thumbX = width * progress

            ZStack(alignment: .leading) {
                // Track
                Capsule()
                    .fill(Color.white.opacity(0.12))
                    .frame(height: 3)

                // Filled (gradient)
                Capsule()
                    .fill(LinearGradient(
                        colors: [
                            Color(red: 0.66, green: 0.88, blue: 1.0),
                            Color.white
                        ],
                        startPoint: .leading,
                        endPoint: .trailing
                    ))
                    .frame(width: thumbX, height: 3)
                    .shadow(color: Color(red: 0.66, green: 0.88, blue: 1.0).opacity(0.6),
                            radius: 4, x: 0, y: 0)

                // Thumb (glowing dot)
                Circle()
                    .fill(Color.white)
                    .frame(width: 10, height: 10)
                    .shadow(color: Color.white.opacity(0.7), radius: 5, x: 0, y: 0)
                    .offset(x: thumbX - 5)
                    .opacity(dragging ? 1 : 0.95)
                    .scaleEffect(dragging ? 1.15 : 1.0)
                    .animation(.easeOut(duration: 0.12), value: dragging)
            }
            .frame(height: 16)
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { g in
                        if !dragging {
                            dragging = true
                            onBegin()
                        }
                        let x = max(0, min(width, g.location.x))
                        value = range.lowerBound + Double(x / width) * total
                    }
                    .onEnded { _ in
                        dragging = false
                        onEnd(value)
                    }
            )
        }
        .frame(height: 16)
    }
}

// MARK: - Volume bar

private struct AuroraVolumeBar: View {
    @Binding var value: Float

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let p = max(0, min(1, CGFloat(value)))
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Color.white.opacity(0.15))
                    .frame(height: 3)
                Capsule()
                    .fill(Color.white.opacity(0.7))
                    .frame(width: w * p, height: 3)
            }
            .frame(height: 16)
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { g in
                        let x = max(0, min(w, g.location.x))
                        value = Float(x / w)
                    }
            )
        }
    }
}
