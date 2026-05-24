import Foundation
import Combine

final class PlaylistManager: ObservableObject {
    @Published private(set) var items: [MediaItem] = []
    @Published var currentIndex: Int? = nil
    @Published var shuffle: Bool = false { didSet { rebuildShuffleOrder() } }
    @Published var loop: LoopMode = .off

    private var shuffleOrder: [Int] = []

    var current: MediaItem? {
        guard let i = currentIndex, items.indices.contains(i) else { return nil }
        return items[i]
    }

    // MARK: - Mutation

    func setItems(_ newItems: [MediaItem], startIndex: Int? = 0) {
        items = newItems
        currentIndex = newItems.isEmpty ? nil : startIndex.map { min(max(0, $0), newItems.count - 1) }
        rebuildShuffleOrder()
    }

    func append(_ newItems: [MediaItem]) {
        let wasEmpty = items.isEmpty
        items.append(contentsOf: newItems)
        if wasEmpty { currentIndex = 0 }
        rebuildShuffleOrder()
    }

    func remove(at offsets: IndexSet) {
        let current = currentIndex
        items.remove(atOffsets: offsets)
        if let c = current {
            if offsets.contains(c) {
                currentIndex = items.indices.contains(c) ? c : (items.isEmpty ? nil : items.count - 1)
            } else {
                let removedBefore = offsets.filter { $0 < c }.count
                currentIndex = c - removedBefore
            }
        }
        rebuildShuffleOrder()
    }

    func move(from source: IndexSet, to destination: Int) {
        let currentItem = current
        items.move(fromOffsets: source, toOffset: destination)
        if let item = currentItem, let newIndex = items.firstIndex(of: item) {
            currentIndex = newIndex
        }
        rebuildShuffleOrder()
    }

    func clear() {
        items = []
        currentIndex = nil
        shuffleOrder = []
    }

    func jump(to index: Int) {
        guard items.indices.contains(index) else { return }
        currentIndex = index
    }

    // MARK: - Navigation

    /// Returns next index given current navigation mode. `userInitiated` is true
    /// when triggered by the next-track command (loop-one still advances), false
    /// when triggered by natural end-of-track (loop-one repeats the same track).
    func nextIndex(userInitiated: Bool) -> Int? {
        guard let current = currentIndex, !items.isEmpty else { return items.isEmpty ? nil : 0 }
        if loop == .one && !userInitiated { return current }

        if shuffle {
            guard let pos = shuffleOrder.firstIndex(of: current) else { return nil }
            let next = pos + 1
            if next < shuffleOrder.count { return shuffleOrder[next] }
            if loop != .off {
                rebuildShuffleOrder()
                return shuffleOrder.first
            }
            return nil
        }

        let next = current + 1
        if next < items.count { return next }
        if loop != .off { return 0 }
        return nil
    }

    func previousIndex() -> Int? {
        guard let current = currentIndex, !items.isEmpty else { return nil }
        if shuffle {
            guard let pos = shuffleOrder.firstIndex(of: current) else { return nil }
            let prev = pos - 1
            if prev >= 0 { return shuffleOrder[prev] }
            if loop != .off { return shuffleOrder.last }
            return nil
        }
        let prev = current - 1
        if prev >= 0 { return prev }
        if loop != .off { return items.count - 1 }
        return nil
    }

    private func rebuildShuffleOrder() {
        guard shuffle, !items.isEmpty else { shuffleOrder = []; return }
        var indices = Array(items.indices)
        indices.shuffle()
        if let current = currentIndex, let pos = indices.firstIndex(of: current), pos != 0 {
            indices.swapAt(0, pos)
        }
        shuffleOrder = indices
    }
}
