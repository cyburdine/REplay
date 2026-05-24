import Foundation
import AVFoundation

struct MediaItem: Identifiable, Hashable, Codable {
    let id: UUID
    let url: URL
    var bookmark: Data?
    var cachedDuration: TimeInterval?

    init(url: URL, id: UUID = UUID(), bookmark: Data? = nil, cachedDuration: TimeInterval? = nil) {
        self.id = id
        self.url = url
        self.bookmark = bookmark
        self.cachedDuration = cachedDuration
    }

    var displayName: String {
        url.deletingPathExtension().lastPathComponent
    }

    var isVideo: Bool {
        let videoExts: Set<String> = ["mp4", "m4v", "mov", "qt"]
        return videoExts.contains(url.pathExtension.lowercased())
    }

    static let supportedExtensions: Set<String> = [
        "mp3", "aac", "m4a", "wav", "aiff", "aif", "flac", "alac",
        "mp4", "m4v", "mov", "qt"
    ]

    static func isSupported(_ url: URL) -> Bool {
        supportedExtensions.contains(url.pathExtension.lowercased())
    }
}
