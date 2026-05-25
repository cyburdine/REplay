export const PATREON_URL = "https://buymeacoffee.com/cyburdine";

export const Support: React.FC = () => {
  return (
    <section id="support" className="relative py-20 md:py-24 px-6 md:px-12">
      <div className="relative max-w-4xl mx-auto">
        <div
          className="relative rounded-3xl p-10 md:p-14 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,120,200,0.10), rgba(80,255,200,0.06) 60%, rgba(80,100,255,0.10))",
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

            {/* Supporters cluster */}
            <div className="relative h-44 md:h-52 hidden md:block">
              <SupporterDots />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SupporterDots: React.FC = () => {
  // 22 placeholder avatars
  const dots = Array.from({ length: 22 }, (_, i) => {
    const hue = (i * 53) % 360;
    const cx = 10 + ((i * 37) % 80);
    const cy = 10 + ((i * 73) % 80);
    const size = 18 + (i % 4) * 4;
    return { hue, cx, cy, size, i };
  });
  return (
    <div className="absolute inset-0">
      {dots.map((d) => (
        <div
          key={d.i}
          className="absolute rounded-full"
          style={{
            left: `${d.cx}%`,
            top: `${d.cy}%`,
            width: d.size,
            height: d.size,
            background: `radial-gradient(circle at 35% 30%, hsl(${d.hue}, 80%, 80%), hsl(${d.hue}, 70%, 50%))`,
            border: "1.5px solid rgba(255,255,255,0.6)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      <div
        className="absolute right-2 bottom-2 text-[11px] text-white/50 font-mono"
      >
        + 240 supporters
      </div>
    </div>
  );
};

const PatreonGlyph: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <circle cx="15" cy="9" r="7" />
    <rect x="2" y="2" width="4" height="20" />
  </svg>
);
