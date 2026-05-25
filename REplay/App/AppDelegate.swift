import AppKit
import SwiftUI

final class AppDelegate: NSObject, NSApplicationDelegate {
    var viewModel: PlayerViewModel?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.activate(ignoringOtherApps: true)
        // Restore window frame after the SwiftUI scene creates the window.
        DispatchQueue.main.async { [weak self] in
            self?.restoreWindowFrame()
            self?.styleMainWindow()
        }
    }

    private func styleMainWindow() {
        guard let window = NSApp.windows.first else { return }
        window.titleVisibility = .hidden

        if window.titlebarAccessoryViewControllers.contains(where: { $0.identifier?.rawValue == "wordmark" }) {
            return
        }

        let wordmark = NSHostingView(rootView:
            HStack(spacing: 0) {
                Image("Wordmark")
                    .resizable()
                    .interpolation(.high)
                    .aspectRatio(contentMode: .fit)
                    .frame(height: 16)
                    .accessibilityLabel("RE:play")
                Spacer(minLength: 0)
            }
            .padding(.leading, 8)
            .frame(height: 28)
        )
        wordmark.translatesAutoresizingMaskIntoConstraints = false
        wordmark.frame = NSRect(x: 0, y: 0, width: 160, height: 28)

        let accessory = NSTitlebarAccessoryViewController()
        accessory.identifier = NSUserInterfaceItemIdentifier("wordmark")
        accessory.view = wordmark
        accessory.layoutAttribute = .leading
        window.addTitlebarAccessoryViewController(accessory)
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
