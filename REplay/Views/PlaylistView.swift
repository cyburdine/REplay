import SwiftUI

struct PlaylistView: View {
    @ObservedObject var viewModel: PlayerViewModel

    var body: some View {
        VStack(spacing: 0) {
            header

            if viewModel.playlist.items.isEmpty {
                emptyState
            } else {
                List {
                    ForEach(Array(viewModel.playlist.items.enumerated()), id: \.element.id) { index, item in
                        row(for: item, index: index)
                            .contentShape(Rectangle())
                            .onTapGesture(count: 2) { viewModel.jump(to: index) }
                            .contextMenu { rowMenu(item: item, index: index) }
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets())
                    }
                    .onMove { source, dest in viewModel.move(from: source, to: dest) }
                    .onDelete { offsets in viewModel.remove(at: offsets) }
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden)
            }
        }
        .background(drawerBackground)
        .overlay(
            // Hairline on the left edge, matching the demo
            Rectangle()
                .fill(Color.white.opacity(0.06))
                .frame(width: 1),
            alignment: .leading
        )
        .contextMenu { backgroundMenu }
    }

    // MARK: - Surface

    private var drawerBackground: some View {
        LinearGradient(
            colors: [
                Color.white.opacity(0.04),
                Color.white.opacity(0.01)
            ],
            startPoint: .top,
            endPoint: .bottom
        )
        .background(
            // Same dark gradient as the audio surface so the drawer reads as
            // part of the player rather than a popover.
            LinearGradient(
                colors: [
                    Color(red: 0.11, green: 0.11, blue: 0.15),
                    Color(red: 0.055, green: 0.055, blue: 0.086)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }

    // MARK: - Header

    private var header: some View {
        HStack {
            Text("PLAYLIST · \(viewModel.playlist.items.count) \(viewModel.playlist.items.count == 1 ? "TRACK" : "TRACKS")")
                .font(.system(size: 10, weight: .medium))
                .tracking(1.5)
                .foregroundStyle(Color.white.opacity(0.45))
            Spacer()
            if !viewModel.playlist.items.isEmpty {
                Button("Clear") { viewModel.clearPlaylist() }
                    .buttonStyle(.plain)
                    .font(.system(size: 11))
                    .foregroundStyle(Color.white.opacity(0.5))
            }
        }
        .padding(.horizontal, 18)
        .padding(.top, 18)
        .padding(.bottom, 10)
    }

    private var emptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: "music.note.list")
                .font(.system(size: 28, weight: .light))
                .foregroundStyle(Color.white.opacity(0.25))
            Text("Drop media here\nor use ⌘O")
                .font(.system(size: 12))
                .foregroundStyle(Color.white.opacity(0.4))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }

    // MARK: - Row

    private func row(for item: MediaItem, index: Int) -> some View {
        let isCurrent = viewModel.playlist.currentIndex == index
        let accent = Color(red: 0.66, green: 0.88, blue: 1.0)
        return HStack(spacing: 12) {
            // Index / play indicator
            Group {
                if isCurrent {
                    Image(systemName: viewModel.media.isPlaying ? "play.fill" : "pause.fill")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(accent)
                } else {
                    Text("\(index + 1)")
                        .font(.system(size: 10, weight: .medium, design: .monospaced))
                        .foregroundStyle(Color.white.opacity(0.3))
                }
            }
            .frame(width: 14, alignment: .center)

            // Title + (kind/artist substitute)
            VStack(alignment: .leading, spacing: 1) {
                Text(item.displayName)
                    .font(.system(size: 13, weight: isCurrent ? .semibold : .medium))
                    .foregroundStyle(isCurrent ? Color.white : Color.white.opacity(0.78))
                    .lineLimit(1)
                Text(item.isVideo ? "Video" : "Audio")
                    .font(.system(size: 11))
                    .foregroundStyle(Color.white.opacity(0.45))
            }

            Spacer(minLength: 6)

            // Duration
            if let dur = item.cachedDuration {
                Text(formatDuration(dur))
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Color.white.opacity(0.35))
            }
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 10)
        .background(rowBackground(isCurrent: isCurrent, accent: accent))
    }

    @ViewBuilder
    private func rowBackground(isCurrent: Bool, accent: Color) -> some View {
        ZStack(alignment: .leading) {
            if isCurrent {
                LinearGradient(
                    colors: [accent.opacity(0.18), accent.opacity(0)],
                    startPoint: .leading,
                    endPoint: .trailing
                )
                Rectangle()
                    .fill(accent)
                    .frame(width: 2)
            }
        }
    }

    private func formatDuration(_ seconds: TimeInterval) -> String {
        let total = Int(seconds.rounded())
        return String(format: "%d:%02d", total / 60, total % 60)
    }

    // MARK: - Context menus

    @ViewBuilder
    private func rowMenu(item: MediaItem, index: Int) -> some View {
        let isCurrent = viewModel.playlist.currentIndex == index

        if isCurrent {
            Button(viewModel.media.isPlaying ? "Pause" : "Play") { viewModel.playPause() }
        } else {
            Button("Play") { viewModel.jump(to: index) }
        }

        Button("Reveal in Finder") { viewModel.revealInFinder(item.url) }
        Button("Copy Path") { viewModel.copyPath(item.url) }

        Divider()

        Button("Remove from Playlist", role: .destructive) {
            viewModel.remove(at: IndexSet(integer: index))
        }
        Button("Clear Playlist", role: .destructive) { viewModel.clearPlaylist() }

        Divider()

        Button("Add Files…") { viewModel.openFilePanel(append: true) }
        Button("Add Folder…") { viewModel.openFolderPanel(append: true) }
    }

    @ViewBuilder
    private var backgroundMenu: some View {
        Button("Open File…") { viewModel.openFilePanel() }
        Button("Open Folder…") { viewModel.openFolderPanel() }
        if !viewModel.playlist.items.isEmpty {
            Button("Add Files…") { viewModel.openFilePanel(append: true) }
            Button("Add Folder…") { viewModel.openFolderPanel(append: true) }
            Divider()
            Button("Clear Playlist", role: .destructive) { viewModel.clearPlaylist() }
        }
    }
}
