import Foundation
import AVFoundation
import Combine
import AppKit

@MainActor
final class PlayerViewModel: ObservableObject {
    let media = MediaPlayerService()
    let playlist = PlaylistManager()
    private let persistence = PersistenceService.shared

    @Published var showPlaylist: Bool = true
    @Published var isFullscreen: Bool = false

    static let speeds: [Float] = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

    private var cancellables = Set<AnyCancellable>()
    private var periodicSaveTimer: Timer?
    private var pendingResumePosition: TimeInterval = 0
    private var bootstrapped = false

    init() {
        // Restore lightweight prefs immediately.
        media.volume = persistence.volume
        media.rate = persistence.playbackRate
        playlist.shuffle = persistence.shuffle
        playlist.loop = persistence.loop

        wireBindings()
    }

    // MARK: - Bootstrap

    func restoreOnLaunch() {
        guard !bootstrapped else { return }
        bootstrapped = true
        let items = persistence.loadPlaylist()
        guard !items.isEmpty else { return }
        playlist.setItems(items, startIndex: persistence.currentIndex ?? 0)
        pendingResumePosition = persistence.lastPosition
        loadCurrent(autoplay: false, startAt: pendingResumePosition)
    }

    // MARK: - Opening files

    func open(urls: [URL], replace: Bool = true) {
        let expanded = expand(urls: urls)
        guard !expanded.isEmpty else { return }
        let newItems = expanded.map { MediaItem(url: $0) }
        if replace {
            playlist.setItems(newItems, startIndex: 0)
        } else {
            playlist.append(newItems)
        }
        loadCurrent(autoplay: true)
        expanded.forEach(persistence.recordRecent)
        persistence.savePlaylist(playlist.items)
    }

    private func expand(urls: [URL]) -> [URL] {
        var out: [URL] = []
        for url in urls {
            var isDir: ObjCBool = false
            guard FileManager.default.fileExists(atPath: url.path, isDirectory: &isDir) else { continue }
            if isDir.boolValue {
                let contents = (try? FileManager.default.contentsOfDirectory(
                    at: url,
                    includingPropertiesForKeys: nil,
                    options: [.skipsHiddenFiles, .skipsSubdirectoryDescendants]
                )) ?? []
                out.append(contentsOf: contents
                    .filter { MediaItem.isSupported($0) }
                    .sorted { $0.lastPathComponent.localizedCaseInsensitiveCompare($1.lastPathComponent) == .orderedAscending }
                )
            } else if MediaItem.isSupported(url) {
                out.append(url)
            }
        }
        return out
    }

    // MARK: - Transport

    func playPause() { media.togglePlayPause() }
    func stop() { media.stop(); persistState() }

    func next(userInitiated: Bool = true) {
        guard let idx = playlist.nextIndex(userInitiated: userInitiated) else {
            media.stop(); return
        }
        playlist.jump(to: idx)
        loadCurrent(autoplay: true)
    }

    func previous() {
        // If more than 3 seconds in, restart current track first
        if media.currentTime > 3 {
            media.seek(to: 0); return
        }
        guard let idx = playlist.previousIndex() else { return }
        playlist.jump(to: idx)
        loadCurrent(autoplay: true)
    }

    func jump(to index: Int) {
        playlist.jump(to: index)
        loadCurrent(autoplay: true)
    }

    func toggleShuffle() {
        playlist.shuffle.toggle()
        persistence.shuffle = playlist.shuffle
    }

    func cycleLoop() {
        playlist.loop = playlist.loop.next
        persistence.loop = playlist.loop
    }

    func setRate(_ rate: Float) {
        media.rate = rate
        persistence.playbackRate = rate
    }

    func toggleMute() {
        media.isMuted.toggle()
    }

    func remove(at offsets: IndexSet) {
        let removingCurrent = playlist.currentIndex.map { offsets.contains($0) } ?? false
        playlist.remove(at: offsets)
        if removingCurrent {
            if playlist.current != nil {
                loadCurrent(autoplay: true)
            } else {
                media.pause()
                media.player.replaceCurrentItem(with: nil)
            }
        }
        persistence.savePlaylist(playlist.items)
    }

    func clearPlaylist() {
        playlist.clear()
        media.pause()
        media.player.replaceCurrentItem(with: nil)
        persistence.savePlaylist([])
        persistence.currentIndex = nil
        persistence.lastPosition = 0
    }

    func move(from source: IndexSet, to destination: Int) {
        playlist.move(from: source, to: destination)
        persistence.savePlaylist(playlist.items)
    }

    func togglePlaylistVisibility() { showPlaylist.toggle() }

    // MARK: - Private

    private func loadCurrent(autoplay: Bool, startAt position: TimeInterval = 0) {
        guard let item = playlist.current else { return }
        media.load(item.url, autoplay: autoplay, startAt: position)
        persistence.currentIndex = playlist.currentIndex
        startPeriodicSave()
    }

    private func wireBindings() {
        // Auto-advance when current track ends.
        media.didFinish
            .sink { [weak self] in self?.next(userInitiated: false) }
            .store(in: &cancellables)

        // Persist volume / rate changes.
        media.$volume
            .dropFirst()
            .debounce(for: .milliseconds(250), scheduler: RunLoop.main)
            .sink { [weak self] v in self?.persistence.volume = v }
            .store(in: &cancellables)
    }

    private func startPeriodicSave() {
        periodicSaveTimer?.invalidate()
        periodicSaveTimer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { [weak self] _ in
            Task { @MainActor in self?.persistState() }
        }
    }

    func persistState() {
        persistence.currentIndex = playlist.currentIndex
        persistence.lastPosition = media.currentTime
        persistence.volume = media.volume
        persistence.shuffle = playlist.shuffle
        persistence.loop = playlist.loop
        persistence.playbackRate = media.rate
    }
}
