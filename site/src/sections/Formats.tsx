const FORMATS = [
  { name: "MP3", kind: "audio" },
  { name: "AAC", kind: "audio" },
  { name: "M4A", kind: "audio" },
  { name: "FLAC", kind: "audio" },
  { name: "ALAC", kind: "audio" },
  { name: "WAV", kind: "audio" },
  { name: "AIFF", kind: "audio" },
  { name: "MP4", kind: "video" },
  { name: "M4V", kind: "video" },
  { name: "MOV", kind: "video" },
  { name: "H.264", kind: "codec" },
  { name: "H.265 / HEVC", kind: "codec" },
  { name: "ProRes", kind: "codec" },
];

export const Formats: React.FC = () => {
  return (
    <section className="relative py-20 md:py-24 px-6 md:px-12">
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
            If you have a codec,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-aurora-mint">
              RE:play can play it!
            </span>
          </h3>
        </div>

        <div className="relative overflow-hidden">
          {/* gradient masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink to-transparent z-10" />

          <div className="flex gap-3 animate-marquee">
            {[...FORMATS, ...FORMATS].map((f, i) => (
              <div
                key={i}
                className="shrink-0 px-4 py-2.5 rounded-full glass text-[13px] tracking-wide flex items-center gap-2"
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{
                    background:
                      f.kind === "audio"
                        ? "#80ffd0"
                        : f.kind === "video"
                        ? "#a0d8ff"
                        : "#ff9ae0",
                    boxShadow: `0 0 8px ${
                      f.kind === "audio"
                        ? "rgba(255,93,200,0.7)"
                        : f.kind === "video"
                        ? "rgba(160,216,255,0.7)"
                        : "rgba(255,154,224,0.7)"
                    }`,
                  }}
                />
                {f.name}
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes marqueeKf {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marqueeKf 36s linear infinite;
            width: max-content;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-marquee { animation: none; }
          }
        `}</style>
      </div>
    </section>
  );
};
