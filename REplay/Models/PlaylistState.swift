import Foundation

enum LoopMode: String, Codable, CaseIterable {
    case off, all, one

    var next: LoopMode {
        switch self {
        case .off: return .all
        case .all: return .one
        case .one: return .off
        }
    }

    var label: String {
        switch self {
        case .off: return "Loop: Off"
        case .all: return "Loop: All"
        case .one: return "Loop: One"
        }
    }

    var symbolName: String {
        switch self {
        case .off: return "repeat"
        case .all: return "repeat"
        case .one: return "repeat.1"
        }
    }
}

struct PlaylistState: Codable {
    var items: [MediaItem] = []
    var currentIndex: Int? = nil
    var lastPosition: TimeInterval = 0
    var shuffle: Bool = false
    var loop: LoopMode = .off
}
