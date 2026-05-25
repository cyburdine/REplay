import { DownloadButton } from "../components/DownloadButton";
import { SiteNav } from "../components/SiteNav";

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

      <SiteNav transparent />

      {/* Hero content */}
      <div className="relative z-10 grid md:grid-cols-[1.15fr_1fr] items-center gap-8 px-6 md:px-12 lg:px-20 pt-12 md:pt-20 pb-32 max-w-7xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 mb-7 text-[11px] text-white/75 tracking-wide">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-aurora-mint shadow-[0_0_8px_rgba(128,255,208,0.9)]" />
            v1.0 · macOS 13 Ventura or later
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-[88px] leading-[0.92] tracking-[-0.03em] text-white">
            <span className="font-light text-white/85">Less player.</span>
            <br />
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-aurora-mint">
              More play.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-white/70 text-[16px] md:text-[17px] leading-relaxed">
            A lightweight, native macOS media player. Built with SwiftUI and
            AVFoundation. Zero third-party dependencies. Audio. Video.
            Anything AVFoundation speaks.
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

          <div className="mt-6 flex items-center gap-4 text-[12px] text-white/45">
            <span>~4 MB</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Free · open source</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Apple Silicon + Intel</span>
          </div>
        </div>

        <HeroOrb />
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink" />
    </section>
  );
};

const HeroOrb: React.FC = () => {
  return (
    <div className="relative aspect-square w-full max-w-[440px] mx-auto md:ml-auto">
      {/* Orbit rings */}
      <div className="absolute inset-0 rounded-full border border-white/12" />
      <div className="absolute inset-[10%] rounded-full border border-white/10" />
      <div className="absolute inset-[22%] rounded-full border border-white/8" />
      {/* Orbiting dot */}
      <div
        className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_12px_white]"
        style={{ animation: "orbitSpin 14s linear infinite", transformOrigin: "0 -180px" }}
      />
      <style>{`
        @keyframes orbitSpin {
          from { transform: translate(-50%, -50%) rotate(0deg) translateY(-180px); }
          to   { transform: translate(-50%, -50%) rotate(360deg) translateY(-180px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="orbitSpin"] { animation: none !important; }
        }
      `}</style>
      {/* Core */}
      <div className="absolute inset-[28%] rounded-full orb-glow"
        style={{
          background:
            "radial-gradient(circle at 35% 28%, #ffffff 0%, #c0e8ff 30%, #6080ff 70%, #2030a0 100%)",
        }}
      />
      <div
        className="absolute inset-[28%] rounded-full mix-blend-overlay opacity-50"
        style={{
          background:
            "radial-gradient(circle at 70% 80%, rgba(160,90,255,0.6), transparent 50%)",
        }}
      />
    </div>
  );
};

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
