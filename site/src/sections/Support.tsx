export const PATREON_URL = "https://buymeacoffee.com/cyburdine";

export const Support: React.FC = () => {
  return (
    <section id="support" className="relative py-20 md:py-24 px-6 md:px-12">
      <div className="relative max-w-4xl mx-auto">
        <div
          className="relative rounded-3xl p-10 md:p-14 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,120,200,0.10), rgba(255,93,200,0.06) 60%, rgba(80,100,255,0.10))",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
            backdropFilter: "blur(18px)",
          }}
        >
          {/* glow */}
          <div
            className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(circle, rgba(255,120,200,0.45), transparent 65%)",
              filter: "blur(40px)",
            }}
          />
          <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <div className="text-[11px] uppercase tracking-[2px] text-aurora-pink mb-3">
                Support our work
              </div>
              <h3 className="font-display text-2xl md:text-4xl font-semibold tracking-tight leading-tight">
                RE:play is free and{" "}
                <span className="text-white/55">built in the open.</span>
              </h3>
              <p className="mt-4 text-white/70 text-[15px] leading-relaxed max-w-md">
                If it earns a spot in your dock, help keep it going. A few
                dollars a month keeps the lights on and the visualizer
                animating.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href={PATREON_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium text-[14px]"
                  style={{
                    background:
                      "linear-gradient(180deg, #ff7ad0 0%, #e65cb8 100%)",
                    color: "#1a0a14",
                    boxShadow:
                      "0 14px 40px rgba(255,120,200,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
                  }}
                >
                  <PatreonGlyph />
                  Buy me a coffee
                  <span aria-hidden>→</span>
                </a>
                <a
                  href="https://github.com/cyburdine/REplay"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass text-[14px] text-white/90 hover:bg-white/10 transition-colors"
                >
                  Star on GitHub ★
                </a>
              </div>
            </div>

            {/* Supporter pulse — animated equalizer with a glowing heart */}
            <div className="relative h-44 md:h-52 hidden md:block">
              <SupporterPulse />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SupporterPulse: React.FC = () => {
  // A symmetric equalizer fanning out from a glowing heart — speaks "audio"
  // and "support" together. Deterministic heights keep the bars feeling
  // composed rather than random.
  const BAR_COUNT = 17;
  const heights = Array.from({ length: BAR_COUNT }, (_, i) => {
    const center = (BAR_COUNT - 1) / 2;
    const dist = Math.abs(i - center) / center; // 0 at center → 1 at edges
    // Falls off toward the edges so the heart sits in the tallest part.
    const base = 1 - Math.pow(dist, 1.5) * 0.75;
    // A second harmonic adds a little visual rhythm so it doesn't read as a
    // perfect arch.
    const wobble = 0.12 * Math.sin(i * 1.7);
    return Math.max(0.18, base + wobble);
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Soft pink halo behind the whole thing */}
      <div
        className="absolute w-56 h-56 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,120,200,0.28), transparent 65%)",
          filter: "blur(14px)",
        }}
      />

      {/* Equalizer bars */}
      <div
        className="relative flex items-end gap-[6px] h-32"
        aria-hidden
      >
        {heights.map((h, i) => (
          <span
            key={i}
            className="block w-[6px] rounded-full"
            style={{
              height: `${Math.round(h * 100)}%`,
              background:
                "linear-gradient(180deg, #ffd1ec 0%, #ff7ad0 45%, #b56cff 100%)",
              boxShadow: "0 0 12px rgba(255,120,200,0.45)",
              animation: `eqPulse ${1.6 + (i % 5) * 0.18}s ease-in-out ${
                i * 0.08
              }s infinite`,
              transformOrigin: "bottom center",
            }}
          />
        ))}
      </div>

      {/* Heart glyph floating over the tallest bars */}
      <div
        className="absolute"
        style={{
          transform: "translateY(-18px)",
          animation: "heartBeat 1.8s ease-in-out infinite",
        }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden>
          <defs>
            <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#ffb6dd" />
              <stop offset="100%" stopColor="#ff5dc8" />
            </linearGradient>
          </defs>
          <path
            d="M12 21s-7-4.35-9.5-9.06C.9 8.69 2.7 5 6.2 5c1.99 0 3.42 1.07 4.3 2.36h.99C12.38 6.07 13.81 5 15.8 5c3.5 0 5.3 3.69 3.7 6.94C19 16.65 12 21 12 21z"
            fill="url(#heartGrad)"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.5"
            style={{ filter: "drop-shadow(0 6px 18px rgba(255,93,200,0.55))" }}
          />
        </svg>
      </div>

      <style>{`
        @keyframes eqPulse {
          0%, 100% { transform: scaleY(0.55); opacity: 0.85; }
          50%      { transform: scaleY(1);    opacity: 1; }
        }
        @keyframes heartBeat {
          0%, 100% { transform: translateY(-18px) scale(1); }
          15%      { transform: translateY(-18px) scale(1.12); }
          30%      { transform: translateY(-18px) scale(1); }
          45%      { transform: translateY(-18px) scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          .relative span, .absolute > svg { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

const PatreonGlyph: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <circle cx="15" cy="9" r="7" />
    <rect x="2" y="2" width="4" height="20" />
  </svg>
);
