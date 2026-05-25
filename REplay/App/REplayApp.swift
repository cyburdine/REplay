import SwiftUI
import AppKit
import UniformTypeIdentifiers

@main
struct REplayApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @StateObject private var viewModel = PlayerViewModel()

    var body: some Scene {
        Window("RE:play", id: "main") {
            ContentView()
                .environmentObject(viewModel)
                .frame(minWidth: 480, minHeight: 320)
                .onAppear { appDelegate.viewModel = viewModel }
        }
        .windowStyle(.titleBar)
        .commands { menuCommands }
    }

    @CommandsBuilder
    private var menuCommands: some Commands {
        CommandGroup(replacing: .appInfo) {
            Button("About RE:play") { AboutWindowController.shared.show() }
        }

        CommandGroup(replacing: .newItem) {
            Button("Open File…") { viewModel.openFilePanel() }
                .keyboardShortcut("o", modifiers: .command)
            Button("Open Folder…") { viewModel.openFolderPanel() }
                .keyboardShortcut("o", modifiers: [.command, .shift])
        }

        CommandGroup(after: .toolbar) {
            Button(viewModel.showPlaylist ? "Hide Playlist" : "Show Playlist") {
                viewModel.togglePlaylistVisibility()
            }
            .keyboardShortcut("l", modifiers: .command)

            Button(viewModel.showVisualizer ? "Hide Visualizer" : "Show Visualizer") {
                viewModel.toggleVisualizer()
            }
            .keyboardShortcut("v", modifiers: [.command, .shift])
        }

        CommandMenu("Playback") {
            Button(viewModel.media.isPlaying ? "Pause" : "Play") {
                viewModel.playPause()
            }
            .keyboardShortcut(.space, modifiers: [])

            Button("Next Track") { viewModel.next() }
                .keyboardShortcut(.rightArrow, modifiers: .command)
            Button("Previous Track") { viewModel.previous() }
                .keyboardShortcut(.leftArrow, modifiers: .command)

            Divider()

            Button("Skip Forward 10s") { viewModel.media.skip(by: 10) }
                .keyboardShortcut(.rightArrow, modifiers: .option)
            Button("Skip Backward 10s") { viewModel.media.skip(by: -10) }
                .keyboardShortcut(.leftArrow, modifiers: .option)

            Button("Step Forward Frame") { viewModel.media.stepFrame(forward: true) }
                .disabled(viewModel.media.isPlaying)
            Button("Step Backward Frame") { viewModel.media.stepFrame(forward: false) }
                .disabled(viewModel.media.isPlaying)

            Divider()

            Button(viewModel.playlist.shuffle ? "Shuffle: On" : "Shuffle: Off") {
                viewModel.toggleShuffle()
            }
            .keyboardShortcut("s", modifiers: .command)

            Button(viewModel.playlist.loop.label) { viewModel.cycleLoop() }
                .keyboardShortcut("r", modifiers: .command)

            Menu("Speed") {
                ForEach(PlayerViewModel.speeds, id: \.self) { s in
                    Button(speedLabel(s)) { viewModel.setRate(s) }
                }
            }
        }
    }

    private func speedLabel(_ s: Float) -> String {
        s.truncatingRemainder(dividingBy: 1) == 0
        ? String(format: "%.0fx", s)
        : String(format: "%.2gx", s)
    }
}
