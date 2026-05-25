const SHORTCUTS: { key: string; action: string }[] = [
  { key: "⌘O", action: "Open File…" },
  { key: "⌘⇧O", action: "Open Folder…" },
  { key: "Space", action: "Play / Pause" },
  { key: "⌘ →  ⌘ ←", action: "Next / Previous track" },
  { key: "⌥ →  ⌥ ←", action: "Skip ± 10 seconds" },
  { key: "→  ←", action: "Step one frame (when paused)" },
  { key: "M", action: "Mute / Unmute" },
  { key: "⌘L", action: "Show / Hide playlist" },
  { key: "⌘S", action: "Toggle shuffle" },
  { key: "⌘R", action: "Cycle loop mode" },
  { key: "⌃⌘F", action: "Toggle fullscreen" },
];

export const Shortcuts: React.FC = () => {
  return (
    <section id="shortcuts" className="relative py-24 md:py-32 px-6 md:px-12">
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-[2px] text-aurora-mint mb-3">
            Keyboard-first
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight">
            Keyboard shortcuts{" "}
            <span className="text-white/55">to make things easy.</span>
          </h2>
        </div>

        <div className="rounded-2xl glass overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10 flex items-center gap-3 bg-white/[0.03]">
            <span className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="font-mono text-[11px] text-white/40">~/replay — keybindings</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {[SHORTCUTS.slice(0, Math.ceil(SHORTCUTS.length / 2)), SHORTCUTS.slice(Math.ceil(SHORTCUTS.length / 2))].map(
              (col, ci) => (
                <ul key={ci} className="divide-y divide-white/5">
                  {col.map((s) => (
                    <li
                      key={s.action}
                      className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02]"
                    >
                      <span className="text-[13.5px] text-white/75">{s.action}</span>
                      <kbd
                        className="font-mono text-[11px] tracking-tight px-2 py-1 rounded-md"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                          border: "1px solid rgba(255,255,255,0.14)",
                          boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.3)",
                          color: "rgba(255,255,255,0.92)",
                        }}
                      >
                        {s.key}
                      </kbd>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
