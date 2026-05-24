import SwiftUI

struct ControlsView: View {
    @ObservedObject var viewModel: PlayerViewModel
    @State private var isScrubbing = false
    @State private var scrubValue: Double = 0

    var body: some View {
        VStack(spacing: 8) {
            seekBar
            HStack(spacing: 14) {
                transportButtons
                Spacer(minLength: 8)
                volumeControl
                speedMenu
            }
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 12)
        .background(.thinMaterial)
    }

    // MARK: - Seek

    private var seekBar: some View {
        HStack(spacing: 10) {
            Text(format(viewModel.media.currentTime))
                .monospacedDigit()
                .font(.system(size: 11))
                .foregroundStyle(.secondary)
                .frame(width: 44, alignment: .trailing)

            Slider(
                value: Binding(
                    get: { isScrubbing ? scrubValue : viewModel.media.currentTime },
                    set: { scrubValue = $0 }
                ),
                in: 0...max(viewModel.media.duration, 0.001),
                onEditingChanged: { editing in
                    if editing {
                        scrubValue = viewModel.media.currentTime
                        isScrubbing = true
                    } else {
                        viewModel.media.seek(to: scrubValue)
                        isScrubbing = false
                    }
                }
            )
            .controlSize(.small)

            Text(format(viewModel.media.duration))
                .monospacedDigit()
                .font(.system(size: 11))
                .foregroundStyle(.secondary)
                .frame(width: 44, alignment: .leading)
        }
    }

    // MARK: - Transport

    private var transportButtons: some View {
        HStack(spacing: 4) {
            iconButton("shuffle",
                       active: viewModel.playlist.shuffle,
                       help: "Shuffle (⌘S)") { viewModel.toggleShuffle() }

            iconButton("backward.fill", help: "Previous (⌘←)") { viewModel.previous() }

            Button { viewModel.playPause() } label: {
                Image(systemName: viewModel.media.isPlaying ? "pause.fill" : "play.fill")
                    .font(.system(size: 18, weight: .medium))
                    .frame(width: 34, height: 34)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .help("Play / Pause (Space)")

            iconButton("forward.fill", help: "Next (⌘→)") { viewModel.next() }

            iconButton(viewModel.playlist.loop.symbolName,
                       active: viewModel.playlist.loop != .off,
                       help: viewModel.playlist.loop.label + " (⌘R)") { viewModel.cycleLoop() }
        }
    }

    private func iconButton(_ symbol: String,
                            active: Bool = false,
                            help: String,
                            action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.system(size: 13, weight: .medium))
                .frame(width: 28, height: 28)
                .foregroundStyle(active ? AnyShapeStyle(.tint) : AnyShapeStyle(.primary))
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .help(help)
    }

    // MARK: - Volume

    private var volumeControl: some View {
        HStack(spacing: 6) {
            Button { viewModel.toggleMute() } label: {
                Image(systemName: volumeSymbol)
                    .font(.system(size: 12))
                    .frame(width: 18)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .help("Mute (M)")

            Slider(value: Binding(
                get: { viewModel.media.volume },
                set: { viewModel.media.volume = $0 }
            ), in: 0...1)
                .controlSize(.small)
                .frame(width: 90)
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
