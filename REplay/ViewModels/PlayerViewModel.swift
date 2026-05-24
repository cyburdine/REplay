import Foundation
import AVFoundation
import Combine
import AppKit
import SwiftUI
import UniformTypeIdentifiers

@MainActor
final class PlayerViewModel: ObservableObject {
    let media = MediaPlayerService()
    let playlist = PlaylistManager()
    private let persistence = PersistenceService.shared

    @Published var showPlaylist: Bool = false
    @Published var isFullscreen: Bool = false
    @Published var showVisualizer: Bool {
        didSet { persistence.showVisualizer = showVisualizer }
    }

    static let speeds: [Float] = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

    private var cancellables = Set<AnyCancellable>()
    private var periodicSaveTimer: Timer?
    private var pendingResumePosition: TimeInterval = 0
    private var bootstrapped = false

    init() {
        self.showVisualizer = PersistenceService.shared.showVisualizer
        // Restore lightweight prefs immediately.
        media.volume = persistence.volume
        media.rate = persistence.playbackRate
        playlist.shuffle = persistence.shuffle
        playlist.loop = persistence.loop

        wireBindings()
    }

    func toggleVisualizer() { showVisualizer.toggle() }

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

    func togglePlaylistVisibility() {
        withAnimation(.easeInOut(duration: 0.35)) {
            showPlaylist.toggle()
        }
    }

    // MARK: - Private

    private func loadCurrent(autoplay: Bool, startAt position: TimeInterval = 0) {
        guard let item = playlist.current else { return }
        media.load(item.url, autoplay: autoplay, startAt: position)
        persistence.currentIndex = playlist.currentIndex
        startPeriodicSave()
    }

    private func wireBindings() {
        // Forward nested ObservableObject changes so SwiftUI re-renders views
        // that observe `viewModel.media.*` / `viewModel.playlist.*`.
        media.objectWillChange
            .sink { [weak self] in self?.objectWillChange.send() }
            .store(in: &cancellables)
        playlist.objectWillChange
            .sink { [weak self] in self?.objectWillChange.send() }
            .store(in: &cancellables)

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

    // MARK: - Open panels & finder helpers

    static var supportedTypes: [UTType] {
        [.audio, .movie, .mp3, .mpeg4Movie, .mpeg4Audio, .wav, .aiff, .quickTimeMovie]
            .compactMap { $0 }
    }

    func openFilePanel(append: Bool = false) {
        let panel = NSOpenPanel()
        panel.allowsMultipleSelection = true
        panel.canChooseFiles = true
        panel.canChooseDirectories = false
        panel.allowedContentTypes = Self.supportedTypes
        if panel.runModal() == .OK {
            open(urls: panel.urls, replace: !append)
        }
    }

    func openFolderPanel(append: Bool = false) {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        if panel.runModal() == .OK, let url = panel.url {
            open(urls: [url], replace: !append)
        }
    }

    func revealInFinder(_ url: URL) {
        NSWorkspace.shared.activateFileViewerSelecting([url])
    }

    func copyPath(_ url: URL) {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(url.path, forType: .string)
    }

    func toggleFullScreen() {
        NSApp.keyWindow?.toggleFullScreen(nil)
    }

    // MARK: - Persistence

    func persistState() {
        persistence.currentIndex = playlist.currentIndex
        persistence.lastPosition = media.currentTime
        persistence.volume = media.volume
        persistence.shuffle = playlist.shuffle
        persistence.loop = playlist.loop
        persistence.playbackRate = media.rate
    }
}
