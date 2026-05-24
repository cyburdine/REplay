import Foundation
import AppKit

final class PersistenceService {
    static let shared = PersistenceService()

    private let fileManager = FileManager.default
    private let stateFileName = "playlist.json"
    private let defaults = UserDefaults.standard

    private enum Key {
        static let volume = "volume"
        static let shuffle = "shuffle"
        static let loop = "loop"
        static let lastPosition = "lastPosition"
        static let currentIndex = "currentIndex"
        static let windowFrame = "windowFrame"
        static let playbackRate = "playbackRate"
        static let recentFiles = "recentFiles"
    }

    private var stateFileURL: URL {
        let appSupport = try? fileManager.url(
            for: .applicationSupportDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: true
        )
        let dir = (appSupport ?? URL(fileURLWithPath: NSTemporaryDirectory()))
            .appendingPathComponent("Replay", isDirectory: true)
        try? fileManager.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent(stateFileName)
    }

    // MARK: - Playlist

    func savePlaylist(_ items: [MediaItem]) {
        let withBookmarks = items.map { item -> MediaItem in
            if item.bookmark != nil { return item }
            var copy = item
            copy.bookmark = try? item.url.bookmarkData(
                options: [.withSecurityScope],
                includingResourceValuesForKeys: nil,
                relativeTo: nil
            )
            return copy
        }
        do {
            let data = try JSONEncoder().encode(withBookmarks)
            try data.write(to: stateFileURL, options: .atomic)
        } catch {
            NSLog("Replay: failed to save playlist – \(error)")
        }
    }

    func loadPlaylist() -> [MediaItem] {
        guard let data = try? Data(contentsOf: stateFileURL),
              let items = try? JSONDecoder().decode([MediaItem].self, from: data) else {
            return []
        }
        return items.compactMap { item in
            if let bookmark = item.bookmark {
                var stale = false
                if let resolved = try? URL(
                    resolvingBookmarkData: bookmark,
                    options: [.withSecurityScope],
                    relativeTo: nil,
                    bookmarkDataIsStale: &stale
                ) {
                    return MediaItem(url: resolved, id: item.id, bookmark: stale ? nil : bookmark, cachedDuration: item.cachedDuration)
                }
            }
            // Fall back to the plain URL if file still exists
            return fileManager.fileExists(atPath: item.url.path) ? item : nil
        }
    }

    // MARK: - Simple values

    var volume: Float {
        get { defaults.object(forKey: Key.volume) as? Float ?? 1.0 }
        set { defaults.set(newValue, forKey: Key.volume) }
    }

    var shuffle: Bool {
        get { defaults.bool(forKey: Key.shuffle) }
        set { defaults.set(newValue, forKey: Key.shuffle) }
    }

    var loop: LoopMode {
        get { LoopMode(rawValue: defaults.string(forKey: Key.loop) ?? "") ?? .off }
        set { defaults.set(newValue.rawValue, forKey: Key.loop) }
    }

    var lastPosition: TimeInterval {
        get { defaults.double(forKey: Key.lastPosition) }
        set { defaults.set(newValue, forKey: Key.lastPosition) }
    }

    var currentIndex: Int? {
        get {
            guard defaults.object(forKey: Key.currentIndex) != nil else { return nil }
            let v = defaults.integer(forKey: Key.currentIndex)
            return v >= 0 ? v : nil
        }
        set {
            if let v = newValue { defaults.set(v, forKey: Key.currentIndex) }
            else { defaults.removeObject(forKey: Key.currentIndex) }
        }
    }

    var playbackRate: Float {
        get {
            let v = defaults.float(forKey: Key.playbackRate)
            return v == 0 ? 1.0 : v
        }
        set { defaults.set(newValue, forKey: Key.playbackRate) }
    }

    // MARK: - Window frame

    func saveWindowFrame(_ frame: NSRect) {
        let dict: [String: CGFloat] = [
            "x": frame.origin.x, "y": frame.origin.y,
            "w": frame.size.width, "h": frame.size.height
        ]
        defaults.set(dict, forKey: Key.windowFrame)
    }

    func loadWindowFrame() -> NSRect? {
        guard let dict = defaults.dictionary(forKey: Key.windowFrame) as? [String: CGFloat],
              let x = dict["x"], let y = dict["y"], let w = dict["w"], let h = dict["h"] else {
            return nil
        }
        return NSRect(x: x, y: y, width: w, height: h)
    }

    // MARK: - Recent files

    func recordRecent(_ url: URL) {
        var list = recentFiles
        list.removeAll { $0 == url }
        list.insert(url, at: 0)
        if list.count > 10 { list = Array(list.prefix(10)) }
        defaults.set(list.map(\.absoluteString), forKey: Key.recentFiles)
        NSDocumentController.shared.noteNewRecentDocumentURL(url)
    }

    var recentFiles: [URL] {
        (defaults.stringArray(forKey: Key.recentFiles) ?? []).compactMap(URL.init(string:))
    }
}
