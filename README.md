# RE:play

A lightweight, native macOS media player — built with SwiftUI, AVFoundation, and zero third-party dependencies.

## Requirements

- macOS 13 (Ventura) or later
- Xcode 15 or later (Apple Swift 5.9+)

## Build

```bash
open REplay.xcodeproj
```

Then select the **REplay** scheme and press ⌘R, or build from the command line:

```bash
xcodebuild -project REplay.xcodeproj -scheme REplay -configuration Release \
           -derivedDataPath build build
```

The product lands at `build/Build/Products/Release/REplay.app`.

## Install

Drag the built `REplay.app` to `/Applications` (it will appear in Finder as **RE:play**):

```bash
cp -R build/Build/Products/Release/REplay.app /Applications/
```

## Supported Formats

Native AVFoundation codec support:

- **Audio:** MP3, AAC, M4A, WAV, AIFF, FLAC, ALAC
- **Video:** MP4, M4V, MOV — any container/codec AVFoundation supports natively (H.264, H.265/HEVC, ProRes, …)

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `⌘O` | Open File… |
| `⌘⇧O` | Open Folder… |
| `Space` | Play / Pause |
| `⌘→` / `⌘←` | Next / Previous track |
| `⌥→` / `⌥←` | Skip ± 10 seconds |
| `→` / `←` (paused) | Step one frame forward / backward |
| `M` | Mute / Unmute |
| `⌘L` | Show / Hide playlist |
| `⌘S` | Toggle shuffle |
| `⌘R` | Cycle loop mode (Off → All → One) |
| `⌃⌘F` | Toggle fullscreen |

## Architecture

```
REplay/
├── App/            REplayApp.swift, AppDelegate.swift
├── Views/          ContentView, PlayerView, ControlsView, PlaylistView, SplashView
├── ViewModels/     PlayerViewModel  (single observable orchestrator)
├── Models/         MediaItem, PlaylistState
├── Services/       MediaPlayerService (AVPlayer wrapper),
│                   PlaylistManager (queue · shuffle · loop),
│                   PersistenceService (UserDefaults + JSON)
└── Resources/      Assets.xcassets, Info.plist
```

`PlayerViewModel` owns one `MediaPlayerService` and one `PlaylistManager` and is the only observable the views consume directly. State is persisted to `UserDefaults` (lightweight values) and `~/Library/Application Support/REplay/playlist.json` (playlist), with security-scoped bookmarks so paths resolve after restart.

## Notes

- The colon in **RE:play** is part of the user-facing name (`CFBundleDisplayName`); on disk the bundle and target are named `REplay`.
- Bundle is signed ad-hoc (`Sign to Run Locally`); switch to a Developer ID signing identity in Xcode for distribution outside `/Applications` on Apple Silicon.
- The placeholder app icon is generated procedurally — replace `REplay/Resources/Assets.xcassets/AppIcon.appiconset/icon_*.png` with a designed asset before shipping.
