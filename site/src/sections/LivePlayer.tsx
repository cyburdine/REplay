import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { REplayComposition } from "../remotion/REplayComposition";
import { FPS, TOTAL_FRAMES, TRACKS, trackSrc } from "../remotion/tracks";

const Player = lazy(() =>
  import("@remotion/player").then((m) => ({ default: m.Player }))
);

export const LivePlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const track = TRACKS[selectedIndex];
  const progress =
    track.durationSeconds > 0
      ? Math.min(1, currentTime / track.durationSeconds)
      : 0;

  // Auto-hide playlist after a short pause
  const playlistTimer = useRef<number | null>(null);
  const flashPlaylist = useCallback(() => {
    setShowPlaylist(true);
    if (playlistTimer.current) window.clearTimeout(playlistTimer.current);
    playlistTimer.current = window.setTimeout(() => {
      setShowPlaylist(false);
      playlistTimer.current = null;
    }, 5000);
  }, []);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      void a.play();
    } else {
      a.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }, []);

  const selectTrack = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      flashPlaylist();
      // Defer play() until after the new src is loaded
      requestAnimationFrame(() => {
        const a = audioRef.current;
        if (!a) return;
        a.currentTime = 0;
        void a.play();
      });
    },
    [flashPlaylist]
  );

  // Keep <audio>.muted in sync if user toggles
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  // Reset current time when track changes
  useEffect(() => {
    setCurrentTime(0);
  }, [selectedIndex]);

  // Keyboard shortcuts when the section is in view
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      const inView = rect.top < window.innerHeight * 0.7 && rect.bottom > 0;
      if (!inView) return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      const a = audioRef.current;
      if (!a) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (a.paused) void a.play();
        else a.pause();
      } else if (e.key === "ArrowRight") {
        a.currentTime = Math.min(track.durationSeconds, a.currentTime + 5);
      } else if (e.key === "ArrowLeft") {
        a.currentTime = Math.max(0, a.currentTime - 5);
      } else if (e.key.toLowerCase() === "m") {
        toggleMute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleMute, track.durationSeconds]);

  return (
    <section
      id="live"
      ref={sectionRef}
      className="relative py-24 md:py-32 px-6 md:px-12"
      role="region"
      aria-label="RE:play interactive demo"
    >
      <div className="aurora-bg secondary" />
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-[2px] text-aurora-mint mb-3">
            Seeing is believing
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight">
            Below is an interactive demo of what the{" "}
            <span className="text-white/55">app looks and feels like.</span>
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto text-[15px]">
            Nothing fancy… just a small reliable media player that just
            works. Tinker around or just download it — it's only 4MB!
          </p>
        </div>

        <div
          className="relative rounded-3xl glass-strong p-3 md:p-5 mx-auto"
          style={{ maxWidth: 1080 }}
        >
          <div
            className="relative rounded-2xl overflow-hidden bg-black"
            style={{ aspectRatio: "16 / 10" }}
          >
            <Suspense fallback={<PlayerSkeleton />}>
              <Player
                component={REplayComposition as React.FC<Record<string, unknown>>}
                inputProps={{
                  trackIndex: selectedIndex,
                  progress,
                  showPlaylist,
                  isPlaying,
                }}
                durationInFrames={TOTAL_FRAMES}
                compositionWidth={1280}
                compositionHeight={800}
                fps={FPS}
                loop
                autoPlay
                controls={false}
                clickToPlay={false}
                doubleClickToFullscreen={false}
                spaceKeyToPlayOrPause={false}
                style={{ width: "100%", height: "100%" }}
              />
            </Suspense>

            {/* Overlay click target = toggle play */}
            <button
              type="button"
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={togglePlay}
              className="absolute inset-0 z-10 cursor-pointer focus:outline-none"
              style={{ background: "transparent" }}
            />

          </div>

          {/* Hidden audio element drives real playback */}
          <audio
            ref={audioRef}
            src={trackSrc(track)}
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onEnded={() => {
              const next = (selectedIndex + 1) % TRACKS.length;
              selectTrack(next);
            }}
          />

          {/* External controls */}
          <div className="mt-4 px-2 flex items-center justify-center gap-2 flex-nowrap overflow-x-auto">
            {TRACKS.map((t, i) => (
              <button
                key={i}
                onClick={() => selectTrack(i)}
                className={
                  "shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap " +
                  (i === selectedIndex
                    ? "bg-white/90 text-ink border-white"
                    : "border-white/15 text-white/70 hover:bg-white/10")
                }
              >
                {t.title}
              </button>
            ))}
            <button
              onClick={togglePlay}
              className="shrink-0 ml-2 px-3 py-1.5 rounded-full bg-white text-ink text-[12px] font-medium whitespace-nowrap"
            >
              {isPlaying ? "❚❚ Pause" : "▶ Play"}
            </button>
            <button
              onClick={toggleMute}
              className="shrink-0 px-3 py-1.5 rounded-full border border-white/15 text-white/70 text-[12px] hover:bg-white/10 whitespace-nowrap"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? "🔇 Muted" : "🔊 On"}
            </button>
          </div>

          <div className="px-2 mt-3 text-[11px] text-white/35 text-center">
            Tip: <kbd className="font-mono">Space</kbd> to play/pause ·{" "}
            <kbd className="font-mono">←/→</kbd> to scrub ·{" "}
            <kbd className="font-mono">M</kbd> to mute
          </div>
        </div>
      </div>
    </section>
  );
};

const PlayerSkeleton: React.FC = () => (
  <div className="absolute inset-0 grid place-items-center">
    <div className="text-white/30 text-sm">Loading player…</div>
  </div>
);
