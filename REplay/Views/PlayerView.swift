import SwiftUI
import AVKit
import AVFoundation

struct PlayerView: View {
    @ObservedObject var viewModel: PlayerViewModel

    var body: some View {
        ZStack {
            if viewModel.media.hasVideo {
                VideoSurface(player: viewModel.media.player)
                    .background(Color.black)
            } else {
                AudioPresentationView(viewModel: viewModel)
            }
        }
        .contextMenu { PlaybackContextMenu(viewModel: viewModel) }
    }
}

// MARK: - Playback context menu

struct PlaybackContextMenu: View {
    @ObservedObject var viewModel: PlayerViewModel

    var body: some View {
        Button(viewModel.media.isPlaying ? "Pause" : "Play") {
            viewModel.playPause()
        }
        .disabled(viewModel.playlist.current == nil)

        Button("Next Track") { viewModel.next() }
            .disabled(viewModel.playlist.items.count < 2)
        Button("Previous Track") { viewModel.previous() }
            .disabled(viewModel.playlist.items.count < 2)

        Divider()

        Button("Skip Forward 10s") { viewModel.media.skip(by: 10) }
        Button("Skip Backward 10s") { viewModel.media.skip(by: -10) }
        Button("Step Forward Frame") { viewModel.media.stepFrame(forward: true) }
            .disabled(viewModel.media.isPlaying)
        Button("Step Backward Frame") { viewModel.media.stepFrame(forward: false) }
            .disabled(viewModel.media.isPlaying)

        Divider()

        Button(viewModel.playlist.shuffle ? "Shuffle ✓" : "Shuffle") { viewModel.toggleShuffle() }
        Menu(viewModel.playlist.loop.label) {
            ForEach(LoopMode.allCases, id: \.self) { mode in
                Button {
                    viewModel.playlist.loop = mode
                } label: {
                    HStack {
                        Text(mode.label)
                        if viewModel.playlist.loop == mode { Image(systemName: "checkmark") }
                    }
                }
            }
        }
        Menu("Speed") {
            ForEach(PlayerViewModel.speeds, id: \.self) { s in
                Button {
                    viewModel.setRate(s)
                } label: {
                    HStack {
                        Text(speedLabel(s))
                        if viewModel.media.rate == s { Image(systemName: "checkmark") }
                    }
                }
            }
        }

        Divider()

        Button(viewModel.media.isMuted ? "Unmute" : "Mute") { viewModel.toggleMute() }
        Button(viewModel.showVisualizer ? "Hide Visualizer" : "Show Visualizer") {
            viewModel.toggleVisualizer()
        }
        Button("Toggle Fullscreen") { viewModel.toggleFullScreen() }
        Button(viewModel.showPlaylist ? "Hide Playlist" : "Show Playlist") {
            viewModel.togglePlaylistVisibility()
        }

        Divider()

        Button("Open File…") { viewModel.openFilePanel() }
        Button("Open Folder…") { viewModel.openFolderPanel() }

        Divider()

        Button("About RE:play") { AboutWindowController.shared.show() }
    }

    private func speedLabel(_ s: Float) -> String {
        s.truncatingRemainder(dividingBy: 1) == 0
        ? String(format: "%.0fx", s)
        : String(format: "%.2gx", s)
    }
}

// MARK: - Video

private struct VideoSurface: NSViewRepresentable {
    let player: AVPlayer

    func makeNSView(context: Context) -> PlayerContainerView {
        let view = PlayerContainerView()
        view.playerLayer.player = player
        view.playerLayer.videoGravity = .resizeAspect
        return view
    }

    func updateNSView(_ nsView: PlayerContainerView, context: Context) {
        if nsView.playerLayer.player !== player {
            nsView.playerLayer.player = player
        }
    }
}

final class PlayerContainerView: NSView {
    let playerLayer = AVPlayerLayer()

    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        wantsLayer = true
        layer = CALayer()
        layer?.backgroundColor = NSColor.black.cgColor
        layer?.addSublayer(playerLayer)
    }

    required init?(coder: NSCoder) { fatalError() }

    override func layout() {
        super.layout()
        playerLayer.frame = bounds
    }
}

// MARK: - Audio presentation

private struct AudioPresentationView: View {
    @ObservedObject var viewModel: PlayerViewModel

    var body: some View {
        ZStack {
            // Dark gradient surface matching the demo (replaces .regularMaterial)
            LinearGradient(
                colors: [
                    Color(red: 0.11, green: 0.11, blue: 0.15),
                    Color(red: 0.055, green: 0.055, blue: 0.086)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            if viewModel.showVisualizer {
                VisualizerView(tap: viewModel.media.visualizerTap)
                    .padding(.horizontal, 24)
                    .padding(.top, 130)
                    .padding(.bottom, 24)
                    .allowsHitTesting(false)
            }

            VStack {
                // Now-playing block, top-centered
                VStack(spacing: 4) {
                    Text("NOW PLAYING")
                        .font(.system(size: 10, weight: .medium))
                        .tracking(2)
                        .foregroundStyle(Color.white.opacity(0.45))

                    Text(viewModel.playlist.current?.displayName ?? "No Track Loaded")
                        .font(.system(size: 22, weight: .semibold))
                        .lineLimit(2)
                        .multilineTextAlignment(.center)
                        .foregroundStyle(Color.white)
                        .padding(.horizontal, 24)
                }
                .padding(.top, 32)

                Spacer()
            }
        }
    }
}
