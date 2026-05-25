import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import type { PlayerRef } from "@remotion/player";
import { REplayComposition } from "../remotion/REplayComposition";
import { FPS, TOTAL_FRAMES, TRACKS, frameWithinTrack, trackStartFrame } from "../remotion/tracks";

const Player = lazy(() =>
  import("@remotion/player").then((m) => ({ default: m.Player }))
);

export const LivePlayer: React.FC = () => {
  const playerRef = useRef<PlayerRef | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [frame, setFrame] = useState(0);
  const [muted, setMuted] = useState(true);

  // Subscribe to player events for play/pause + frame
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onFrame = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("frameupdate", onFrame);
    return () => {
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("frameupdate", onFrame);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isPlaying()) p.pause();
    else p.play();
  }, []);

  const seekToTrack = useCallback((index: number) => {
    const p = playerRef.current;
    if (!p) return;
    p.seekTo(trackStartFrame(index));
    p.play();
  }, []);

  const within = frameWithinTrack(frame);
  const track = TRACKS[within.index];

  // Keyboard shortcuts when the section is in view & focused
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Only act if the section is roughly in view
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      const inView = rect.top < window.innerHeight * 0.7 && rect.bottom > 0;
      if (!inView) return;
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      const p = playerRef.current;
      if (!p) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (p.isPlaying()) p.pause();
        else p.play();
      } else if (e.key === "ArrowRight") {
        const cur = p.getCurrentFrame();
        p.seekTo(Math.min(TOTAL_FRAMES - 1, cur + FPS * 5));
      } else if (e.key === "ArrowLeft") {
        const cur = p.getCurrentFrame();
        p.seekTo(Math.max(0, cur - FPS * 5));
      } else if (e.key.toLowerCase() === "m") {
        setMuted((m) => !m);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
                ref={playerRef}
                component={REplayComposition}
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

            {/* Center play overlay when paused */}
            {!isPlaying && (
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(220,230,255,0.85))",
                    boxShadow:
                      "0 20px 60px rgba(160,90,255,0.55), inset 0 1px 0 rgba(255,255,255,0.9)",
                  }}
                >
                  <span className="text-2xl text-ink ml-1">▶</span>
                </div>
              </div>
            )}
          </div>

          {/* External controls (in-browser, not part of the comp) */}
          <div className="mt-4 px-2 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-[12px] text-white/55">
              <span className="font-mono">{formatTime(within.local / FPS)}</span>
              <span>/</span>
              <span className="font-mono">{formatTime(within.length / FPS)}</span>
              <span className="ml-3 text-white/40 hidden sm:inline">
                Now: <span className="text-white/75">{track.title}</span>
                <span className="text-white/35"> — {track.artist}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {TRACKS.map((t, i) => (
                <button
                  key={i}
                  onClick={() => seekToTrack(i)}
                  className={
                    "text-[11px] px-2.5 py-1 rounded-full border transition-colors " +
                    (i === within.index
                      ? "bg-white/90 text-ink border-white"
                      : "border-white/15 text-white/70 hover:bg-white/10")
                  }
                >
                  {t.title}
                </button>
              ))}
              <button
                onClick={togglePlay}
                className="ml-2 px-3 py-1.5 rounded-full bg-white text-ink text-[12px] font-medium"
              >
                {isPlaying ? "❚❚ Pause" : "▶ Play"}
              </button>
              <button
                onClick={() => setMuted((m) => !m)}
                className="px-3 py-1.5 rounded-full border border-white/15 text-white/70 text-[12px] hover:bg-white/10"
                aria-label={muted ? "Unmute" : "Mute"}
                title="Audio is decorative — visualizer is rendered from a deterministic spectrum"
              >
                {muted ? "🔇 Muted" : "🔊 On"}
              </button>
            </div>
          </div>

          <div className="px-2 mt-3 text-[11px] text-white/35 text-center">
            Tip: <kbd className="font-mono">Space</kbd> to play/pause ·{" "}
            <kbd className="font-mono">←/→</kbd> to scrub
          </div>
        </div>
      </div>
    </section>
  );
};

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

const PlayerSkeleton: React.FC = () => (
  <div className="absolute inset-0 grid place-items-center">
    <div className="text-white/30 text-sm">Loading player…</div>
  </div>
);
