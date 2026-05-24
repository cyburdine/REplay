export const DOWNLOAD_URL =
  "https://github.com/your/replay/releases/latest/download/REplay.dmg";

export const DownloadButton: React.FC<{ large?: boolean; label?: string }> = ({
  large,
  label = "Download for macOS",
}) => {
  return (
    <a
      href={DOWNLOAD_URL}
      className={
        "group relative inline-flex items-center gap-3 rounded-xl font-medium text-ink overflow-hidden " +
        (large ? "px-6 py-3.5 text-[15px]" : "px-5 py-3 text-[14px]")
      }
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #e9f0ff 100%)",
        boxShadow:
          "0 14px 40px rgba(120,170,255,0.25), 0 0 0 1px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <AppleGlyph />
      <span>{label}</span>
      <span
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden
      >
        →
      </span>
      {/* Shine */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            "linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.65) 50%, transparent 65%)",
          transform: "translateX(-100%)",
          animation: "btnShine 1.4s ease-in-out",
        }}
      />
      <style>{`@keyframes btnShine { from { transform: translateX(-100%) } to { transform: translateX(100%) } }`}</style>
    </a>
  );
};

const AppleGlyph: React.FC = () => (
  <svg width="14" height="17" viewBox="0 0 14 17" fill="currentColor" aria-hidden>
    <path d="M11.6 9.05c.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.71-3.18-1.73-1.35-.14-2.64.8-3.33.8-.7 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.18C-1.06 8.93.09 12.97 1.6 15.2c.75 1.09 1.64 2.31 2.81 2.27 1.13-.05 1.55-.73 2.92-.73 1.36 0 1.74.73 2.93.7 1.21-.02 1.98-1.11 2.72-2.2.86-1.26 1.21-2.49 1.23-2.55-.03-.01-2.36-.91-2.38-3.59zM9.41 2.96c.61-.74 1.03-1.78.92-2.81-.89.04-1.96.59-2.59 1.33-.57.65-1.07 1.7-.94 2.72 1 .07 2-.5 2.61-1.24z" />
  </svg>
);
