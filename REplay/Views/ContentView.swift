import SwiftUI
import UniformTypeIdentifiers
import AppKit

struct ContentView: View {
    @EnvironmentObject var viewModel: PlayerViewModel
    @State private var showSplash: Bool = true
    @State private var isDropTargeted: Bool = false

    var body: some View {
        ZStack {
            mainLayout

            if showSplash {
                SplashView()
                    .transition(.opacity)
                    .zIndex(1)
            }

            if isDropTargeted {
                RoundedRectangle(cornerRadius: 12)
                    .strokeBorder(Color.accentColor, lineWidth: 3)
                    .padding(8)
                    .allowsHitTesting(false)
            }
        }
        .onAppear {
            viewModel.restoreOnLaunch()
            scheduleSplashDismiss()
        }
        .onDrop(of: [.fileURL], isTargeted: $isDropTargeted, perform: handleDrop)
        .background(KeyMonitor(viewModel: viewModel))
    }

    @ViewBuilder
    private var mainLayout: some View {
        // Body area (player + drawer overlay) on top, controls bar always
        // full-width at the bottom. The drawer slides over the body only,
        // so the controls never shift.
        let drawerWidth: CGFloat = 280
        VStack(spacing: 0) {
            ZStack(alignment: .trailing) {
                PlayerView(viewModel: viewModel)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.trailing, viewModel.showPlaylist ? drawerWidth : 0)

                PlaylistView(viewModel: viewModel)
                    .frame(width: drawerWidth)
                    .frame(maxHeight: .infinity)
                    .offset(x: viewModel.showPlaylist ? 0 : drawerWidth)

                PlaylistToggleTab(isOpen: viewModel.showPlaylist) {
                    viewModel.togglePlaylistVisibility()
                }
                .offset(x: viewModel.showPlaylist ? -drawerWidth : 0)
            }
            .clipped()

            ControlsView(viewModel: viewModel)
        }
    }

    private func scheduleSplashDismiss() {
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 1_200_000_000)
            withAnimation(.easeOut(duration: 0.4)) { showSplash = false }
        }
    }

    private func handleDrop(providers: [NSItemProvider]) -> Bool {
        var urls: [URL] = []
        let group = DispatchGroup()
        for provider in providers {
            group.enter()
            _ = provider.loadObject(ofClass: URL.self) { url, _ in
                if let url { urls.append(url) }
                group.leave()
            }
        }
        group.notify(queue: .main) {
            guard !urls.isEmpty else { return }
            viewModel.open(urls: urls, replace: true)
        }
        return true
    }
}

// MARK: - Playlist toggle tab

/// Small vertical pill anchored to the right edge of the player. Clicking
/// it slides the playlist in/out. Chevron points in the direction the drawer
/// will move on the next click.
private struct PlaylistToggleTab: View {
    let isOpen: Bool
    let onTap: () -> Void
    @State private var hovering = false

    var body: some View {
        Button(action: onTap) {
            Image(systemName: isOpen ? "chevron.right" : "chevron.left")
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(Color.white.opacity(hovering ? 0.95 : 0.65))
                .frame(width: 18, height: 56)
                .background(
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color.white.opacity(hovering ? 0.14 : 0.08))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .strokeBorder(Color.white.opacity(0.12), lineWidth: 1)
                )
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .help(isOpen ? "Hide playlist (⌘L)" : "Show playlist (⌘L)")
        .onHover { hovering = $0 }
        .padding(.trailing, 6)
    }
}

// MARK: - Key handling

/// Captures plain-key events (space, M, arrows) that SwiftUI's `.keyboardShortcut`
/// can't bind without a modifier. Command-key shortcuts come from the menu.
private struct KeyMonitor: NSViewRepresentable {
    let viewModel: PlayerViewModel

    func makeNSView(context: Context) -> NSView {
        let view = KeyMonitorView()
        view.viewModel = viewModel
        return view
    }

    func updateNSView(_ nsView: NSView, context: Context) {}
}

private final class KeyMonitorView: NSView {
    weak var viewModel: PlayerViewModel?
    private var monitor: Any?

    override func viewDidMoveToWindow() {
        super.viewDidMoveToWindow()
        guard window != nil, monitor == nil else { return }
        monitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
            self?.handle(event) == true ? nil : event
        }
    }

    deinit {
        if let monitor { NSEvent.removeMonitor(monitor) }
    }

    @MainActor
    private func handle(_ event: NSEvent) -> Bool {
        guard let vm = viewModel,
              let window = self.window,
              event.window === window else { return false }

        // Ignore when a text field has focus
        if window.firstResponder is NSText { return false }

        let modifiers = event.modifierFlags.intersection(.deviceIndependentFlagsMask)
        let plain = modifiers.isEmpty || modifiers == .numericPad

        // Plain keys
        if plain {
            switch event.keyCode {
            case 49: // space
                vm.playPause(); return true
            case 46: // M
                vm.toggleMute(); return true
            case 123: // left arrow
                if !vm.media.isPlaying { vm.media.stepFrame(forward: false); return true }
                return false
            case 124: // right arrow
                if !vm.media.isPlaying { vm.media.stepFrame(forward: true); return true }
                return false
            default: break
            }
        }

        // Option + arrows = ±10s skip
        if modifiers == .option {
            switch event.keyCode {
            case 123: vm.media.skip(by: -10); return true
            case 124: vm.media.skip(by: 10); return true
            default: break
            }
        }

        return false
    }
}
