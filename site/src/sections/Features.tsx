type Feature = {
  title: string;
  body: string;
  icon: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: "Native macOS",
    body: "SwiftUI + AVFoundation. Talks directly to the hardware. No Electron, no Chromium, no surprises.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M17 8a4 4 0 1 0-8 0c0 3 4 5 4 5s4-2 4-5z" />
        <path d="M5 14h14v6H5z" />
      </svg>
    ),
  },
  {
    title: "Zero dependencies",
    body: "Not one third-party package. A ~4 MB binary you can audit in a single afternoon.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    ),
  },
  {
    title: "Audio + Video",
    body: "MP3, AAC, FLAC, ALAC, WAV, AIFF · MP4, M4V, MOV with H.264, H.265, ProRes — and everything else AVFoundation speaks.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M10 9.5v5l4-2.5z" />
      </svg>
    ),
  },
  {
    title: "Smart playlist",
    body: "Drag in a folder. Shuffle, repeat, persist across launches with security-scoped bookmarks.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M4 6h13M4 12h13M4 18h9" />
        <circle cx="20" cy="18" r="2" />
      </svg>
    ),
  },
  {
    title: "Keyboard-first",
    body: "Space, arrows, ⌘O. Frame-stepping, ±10s skipping, loop & shuffle toggles. Built for the kind of person who closes the trackpad.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
      </svg>
    ),
  },
  {
    title: "Audio visualizer",
    body: "Real-time spectrum analysis on the audio tap. Decorative. Mesmerizing. Toggleable.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M4 14v-4M8 18V6M12 16V8M16 19V5M20 15v-6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="relative py-24 md:py-32 px-6 md:px-12">
      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <div className="text-[11px] uppercase tracking-[2px] text-aurora-mint mb-3">
            What's inside
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight">
            Small surface. <span className="text-white/55">Serious depth.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl glass p-6 overflow-hidden hover:bg-white/[0.06] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-aurora-mint"
                   style={{
                     background:
                       "linear-gradient(180deg, rgba(128,255,208,0.15), rgba(128,255,208,0.03))",
                     border: "1px solid rgba(128,255,208,0.2)",
                   }}
              >
                <span className="w-5 h-5 block">{f.icon}</span>
              </div>
              <h3 className="font-display text-[17px] font-semibold mb-2">{f.title}</h3>
              <p className="text-[14px] text-white/65 leading-relaxed">{f.body}</p>
              <div className="pointer-events-none absolute -bottom-12 -right-12 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                   style={{
                     background:
                       "radial-gradient(circle, rgba(128,255,208,0.18), transparent 60%)",
                     filter: "blur(20px)",
                   }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
