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

/// Replacement for `.symbolEffect(.variableColor)` which is macOS 14+.
/// Uses a manual opacity pulse compatible with macOS 13.
private struct WaveformIcon: View {
    let isPlaying: Bool
    @State private var pulse = false

    var body: some View {
        Image(systemName: "waveform")
            .opacity(isPlaying ? (pulse ? 1.0 : 0.5) : 1.0)
            .animation(isPlaying ? .easeInOut(duration: 1.0).repeatForever(autoreverses: true) : .default,
                       value: pulse)
            .onAppear { if isPlaying { pulse.toggle() } }
            .onChange(of: isPlaying) { newValue in
                pulse = newValue ? !pulse : false
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
            Rectangle().fill(.regularMaterial)
            VStack(spacing: 18) {
                WaveformIcon(isPlaying: viewModel.media.isPlaying)
                    .font(.system(size: 64, weight: .light))
                    .foregroundStyle(.tint)

                Text(viewModel.playlist.current?.displayName ?? "No Track Loaded")
                    .font(.system(size: 18, weight: .medium))
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
                    .foregroundStyle(.primary)
            }
        }
    }
}
