import { Suspense, lazy } from "react";
import { DownloadButton } from "../components/DownloadButton";
import {
  HeroIconComposition,
  HERO_DURATION_FRAMES,
  HERO_SIZE,
} from "../remotion/HeroIconComposition";

const Player = lazy(() =>
  import("@remotion/player").then((m) => ({ default: m.Player }))
);

export const Hero: React.FC = () => {
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-ink" />
      <div className="aurora-bg" />
      <div className="aurora-bg secondary" />
      <div className="scan-overlay" />
      <div className="grain" />

      {/* Stars */}
      <Stars />

      {/* Remotion orb — large, absolutely positioned so it overflows the
          right column and bleeds behind the text on the left for depth.
          pointer-events: none so it never blocks button/link interactions. */}
      <div
        className="pointer-events-none absolute z-[2] hidden md:block"
        style={{
          top: "50%",
          right: "-14%",
          // -46% centers vertically; the extra -400px lifts the icon up so it
          // sits in line with the headline block on the left, letting the top
          // of the orb extend above the viewport.
          transform: "translateY(calc(-46% - 150px))",
          width: "min(1300px, 110vw)",
          aspectRatio: "1 / 1",
        }}
      >
        <HeroPlayPulse />
      </div>

      {/* Hero content */}
      <div className="relative z-10 grid md:grid-cols-[1.15fr_1fr] items-center gap-8 px-6 md:px-12 lg:px-20 pt-12 md:pt-20 pb-32 max-w-7xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 mb-7 text-[11px] text-white/75 tracking-wide">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-aurora-mint shadow-[0_0_8px_rgba(255,93,200,0.9)]" />
            v1.0 · macOS 13 Ventura or later
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-[88px] leading-[0.92] tracking-[-0.03em] text-white">
            <span className="font-light text-white/85">Less player.</span>
            <br />
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white via-aurora-pink to-aurora-violet">
              More play.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-white/70 text-[16px] md:text-[17px] leading-relaxed">
            A lightweight, native macOS media player. Built to replace bulky
            overly featured music libraries. Zero third-party dependencies.
            Plays Audio. Video. In every format we could think of.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <DownloadButton large />
            <a
              href="#live"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass text-[14px] text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              See it live ↓
            </a>
          </div>

        </div>

        {/* On mobile the orb gets its own grid cell (smaller, in-flow).
            On md+ this is hidden and the full-size overflow orb above takes
            over. */}
        <div className="md:hidden">
          <HeroPlayPulse />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink" />
    </section>
  );
};

const HeroPlayPulse: React.FC = () => {
  // The hero visual is a Remotion composition rendered live in the page via
  // @remotion/player — frame-perfect motion graphics (orbital particles,
  // beat-driven pulse rings, sweeping godrays, conic aurora) that would be
  // painful to coordinate in plain CSS keyframes.
  return (
    <div
      // Fills whatever container it's placed in. The radial mask feathers
      // the rectangular Player to a circle so the orb has no visible edges.
      className="relative aspect-square w-full h-full mx-auto select-none"
      style={{
        maskImage:
          "radial-gradient(circle at 50% 50%, black 28%, rgba(0,0,0,0.9) 45%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.15) 80%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(circle at 50% 50%, black 28%, rgba(0,0,0,0.9) 45%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.15) 80%, transparent 100%)",
      }}
    >
      <Suspense fallback={<HeroFallback />}>
        <Player
          component={HeroIconComposition}
          compositionWidth={HERO_SIZE}
          compositionHeight={HERO_SIZE}
          fps={30}
          durationInFrames={HERO_DURATION_FRAMES}
          autoPlay
          loop
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          style={{
            width: "100%",
            height: "100%",
            background: "transparent",
          }}
        />
      </Suspense>
    </div>
  );
};

const HeroFallback: React.FC = () => (
  <div className="absolute inset-0 grid place-items-center">
    <img
      src="/app-icon.png"
      alt=""
      aria-hidden
      draggable={false}
      className="w-[55%] h-[55%] object-contain opacity-90"
      style={{ mixBlendMode: "screen" }}
    />
  </div>
);

const Stars: React.FC = () => {
  // 50 deterministic stars
  const stars = Array.from({ length: 50 }, (_, i) => {
    const x = (i * 9301 + 49297) % 100;
    const y = (i * 233280 + 7919) % 100;
    const size = ((i * 13) % 3) + 1;
    const delay = (i % 9) * 0.3;
    return { x, y, size, delay, i };
  });
  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s) => (
        <span
          key={s.i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: 0.15,
            animation: `twinkle 4s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes twinkle { 0%,100% { opacity: 0.1 } 50% { opacity: 0.85 } }`}</style>
    </div>
  );
};
