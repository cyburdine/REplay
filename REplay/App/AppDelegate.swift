import AppKit

final class AppDelegate: NSObject, NSApplicationDelegate {
    var viewModel: PlayerViewModel?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.activate(ignoringOtherApps: true)
        // Restore window frame after the SwiftUI scene creates the window.
        DispatchQueue.main.async { [weak self] in
            self?.restoreWindowFrame()
        }
    }

    func application(_ sender: NSApplication, openFiles filenames: [String]) {
        let urls = filenames.map { URL(fileURLWithPath: $0) }
        Task { @MainActor in viewModel?.open(urls: urls, replace: true) }
        sender.reply(toOpenOrPrint: .success)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }

    func applicationWillTerminate(_ notification: Notification) {
        if let window = NSApp.windows.first(where: { $0.isVisible }) {
            PersistenceService.shared.saveWindowFrame(window.frame)
        }
        Task { @MainActor in viewModel?.persistState() }
    }

    private func restoreWindowFrame() {
        guard let frame = PersistenceService.shared.loadWindowFrame(),
              let window = NSApp.windows.first else { return }
        window.setFrame(frame, display: true)
    }
}
