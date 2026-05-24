import SwiftUI
import AppKit

struct AboutView: View {
    private let appIcon: NSImage = NSApp.applicationIconImage ?? NSImage()

    private var version: String {
        let dict = Bundle.main.infoDictionary ?? [:]
        let v = dict["CFBundleShortVersionString"] as? String ?? "1.0"
        let b = dict["CFBundleVersion"] as? String ?? "1"
        return "Build \(v) (\(b))"
    }

    private let homeURL = URL(string: "https://github.com/cyburdine/REplay")!
    private let issuesURL = URL(string: "https://github.com/cyburdine/REplay/issues")!

    var body: some View {
        VStack(spacing: 0) {
            header
                .padding(.horizontal, 24)
                .padding(.top, 24)
                .padding(.bottom, 18)

            Divider().opacity(0.5)

            VStack(alignment: .leading, spacing: 14) {
                Text("A lightweight, native macOS media player built with SwiftUI and AVFoundation. Zero third-party dependencies.")
                    .font(.system(size: 12))
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)

                VStack(alignment: .leading, spacing: 4) {
                    Text("Built with")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(.secondary)
                    Text("SwiftUI · AppKit · AVFoundation · Accelerate (vDSP) · MediaToolbox")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(.tertiary)
                }

                Spacer(minLength: 6)

                HStack(spacing: 14) {
                    linkButton("Home Page", url: homeURL)
                    Text("·").foregroundStyle(.tertiary)
                    linkButton("Report a Bug", url: issuesURL)
                    Text("·").foregroundStyle(.tertiary)
                    linkButton("Credits", url: homeURL.appendingPathComponent("graphs/contributors"))
                }
                .font(.system(size: 11))
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)

            Spacer(minLength: 0)

            HStack {
                Text("© 2026 cyburdine. All rights reserved.")
                Spacer()
                Text("Re:play is open source.")
            }
            .font(.system(size: 10))
            .foregroundStyle(.tertiary)
            .padding(.horizontal, 24)
            .padding(.bottom, 16)
        }
        .frame(width: 420, height: 360)
        .background(.regularMaterial)
    }

    private var header: some View {
        HStack(alignment: .top, spacing: 18) {
            Image(nsImage: appIcon)
                .resizable()
                .interpolation(.high)
                .frame(width: 96, height: 96)
                .shadow(color: .black.opacity(0.22), radius: 6, y: 2)

            VStack(alignment: .leading, spacing: 4) {
                Text("RE:play")
                    .font(.system(size: 36, weight: .semibold))
                    .kerning(-0.5)
                Text("By cyburdine")
                    .font(.system(size: 12))
                    .foregroundStyle(.secondary)
                Text(version)
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(.tertiary)
                    .padding(.top, 2)
            }
            Spacer(minLength: 0)
        }
    }

    private func linkButton(_ title: String, url: URL) -> some View {
        Button(title) { NSWorkspace.shared.open(url) }
            .buttonStyle(.link)
    }
}

// MARK: - Window controller

@MainActor
final class AboutWindowController {
    static let shared = AboutWindowController()
    private var window: NSWindow?

    func show() {
        if let window {
            window.makeKeyAndOrderFront(nil)
            NSApp.activate(ignoringOtherApps: true)
            return
        }

        let hosting = NSHostingController(rootView: AboutView())
        let win = NSWindow(contentViewController: hosting)
        win.title = "About RE:play"
        win.styleMask = [.titled, .closable]
        win.isMovableByWindowBackground = true
        win.titlebarAppearsTransparent = true
        win.titleVisibility = .hidden
        win.isReleasedWhenClosed = false
        win.center()
        self.window = win

        NotificationCenter.default.addObserver(forName: NSWindow.willCloseNotification,
                                               object: win, queue: .main) { [weak self] _ in
            Task { @MainActor in self?.window = nil }
        }

        win.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }
}
