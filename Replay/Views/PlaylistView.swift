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
                            .contextMenu {
                                Button("Play") { viewModel.jump(to: index) }
                                Button("Remove", role: .destructive) {
                                    viewModel.remove(at: IndexSet(integer: index))
                                }
                            }
                    }
                    .onMove { source, dest in viewModel.move(from: source, to: dest) }
                    .onDelete { offsets in viewModel.remove(at: offsets) }
                }
                .listStyle(.sidebar)
                .scrollContentBackground(.hidden)
            }
        }
        .background(.regularMaterial)
        .frame(minWidth: 220)
    }

    private var header: some View {
        HStack {
            Text("Playlist")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(.secondary)
            Spacer()
            if !viewModel.playlist.items.isEmpty {
                Button("Clear") { viewModel.clearPlaylist() }
                    .buttonStyle(.plain)
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
    }

    private var emptyState: some View {
        VStack(spacing: 8) {
            Image(systemName: "music.note.list")
                .font(.system(size: 32, weight: .light))
                .foregroundStyle(.tertiary)
            Text("Drop media here\nor use ⌘O")
                .font(.system(size: 12))
                .foregroundStyle(.tertiary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }

    private func row(for item: MediaItem, index: Int) -> some View {
        let isCurrent = viewModel.playlist.currentIndex == index
        return HStack(spacing: 10) {
            Image(systemName: isCurrent
                  ? (viewModel.media.isPlaying ? "speaker.wave.2.fill" : "pause.fill")
                  : (item.isVideo ? "film" : "music.note"))
                .foregroundStyle(isCurrent ? AnyShapeStyle(.tint) : AnyShapeStyle(.secondary))
                .frame(width: 16)

            VStack(alignment: .leading, spacing: 2) {
                Text(item.displayName)
                    .font(.system(size: 12, weight: isCurrent ? .semibold : .regular))
                    .lineLimit(1)
                if let dur = item.cachedDuration {
                    Text(formatDuration(dur))
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundStyle(.tertiary)
                }
            }
        }
        .padding(.vertical, 2)
    }

    private func formatDuration(_ seconds: TimeInterval) -> String {
        let total = Int(seconds.rounded())
        return String(format: "%d:%02d", total / 60, total % 60)
    }
}
