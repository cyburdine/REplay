import { useEffect, useState } from "react";
import { PageShell } from "../components/PageShell";

const SECTIONS = [
  { id: "getting-started", label: "Getting Started" },
  { id: "shortcuts", label: "Keyboard Shortcuts" },
  { id: "formats", label: "Supported Formats" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "privacy", label: "State & Privacy" },
];

export const Docs: React.FC = () => {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-24">
        <div className="mb-12 md:mb-16 max-w-3xl">
          <p className="text-[12px] tracking-[0.2em] uppercase text-aurora-mint/80 mb-4">
            Documentation
          </p>
          <h1 className="font-display text-4xl md:text-6xl tracking-[-0.025em] leading-[0.95]">
            <span className="font-light text-white/85">Read the</span>{" "}
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white to-aurora-mint">
              docs.
            </span>
          </h1>
          <p className="mt-6 text-white/65 text-[15px] md:text-[17px] leading-relaxed">
            Everything you need to know about RE:play in one place. Short by design.
          </p>
        </div>

        <div className="grid md:grid-cols-[200px_1fr] gap-10 md:gap-16">
          {/* Sticky TOC */}
          <aside className="hidden md:block">
            <div className="sticky top-8">
              <p className="text-[11px] tracking-[0.18em] uppercase text-white/40 mb-4">On this page</p>
              <nav className="flex flex-col gap-1.5">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={
                      "text-[13px] py-1.5 pl-3 border-l transition-colors " +
                      (active === s.id
                        ? "text-white border-aurora-mint"
                        : "text-white/55 border-white/10 hover:text-white/90 hover:border-white/30")
                    }
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="space-y-16 max-w-2xl">
            <Section id="getting-started" title="Getting Started">
              <p>
                Download the latest <code>.dmg</code> from the GitHub Releases page, open it, and drag
                RE:play to your Applications folder. First launch will trigger Gatekeeper — right-click
                the app and choose Open to confirm.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-white/65 pl-1">
                <li>Drop a media file onto the window, or use <Kbd>⌘O</Kbd> to open one.</li>
                <li>Drop a folder, or <Kbd>⌘⇧O</Kbd> to load a folder's top-level media into the playlist.</li>
                <li>Toggle the playlist sidebar with <Kbd>⌘L</Kbd>.</li>
                <li>Spacebar to play/pause. Arrow keys to seek. That's the whole app.</li>
              </ol>
            </Section>

            <Section id="shortcuts" title="Keyboard Shortcuts">
              <ShortcutTable
                rows={[
                  ["Space", "Play / Pause"],
                  ["← / →", "Frame step (paused) · seek (playing)"],
                  ["⌥← / ⌥→", "Skip back / forward 10s"],
                  ["⌘← / ⌘→", "Previous / next track"],
                  ["⌘O", "Open file"],
                  ["⌘⇧O", "Open folder"],
                  ["⌘L", "Toggle playlist sidebar"],
                  ["⌘S", "Toggle shuffle"],
                  ["⌘R", "Cycle loop mode (off / all / one)"],
                  ["M", "Mute"],
                  ["⌃⌘F", "Toggle fullscreen"],
                ]}
              />
            </Section>

            <Section id="formats" title="Supported Formats">
              <p>
                RE:play uses AVFoundation, so anything macOS can decode natively will play. No codec
                packs, no extra installs.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="rounded-xl glass p-4">
                  <p className="text-[12px] uppercase tracking-wider text-aurora-mint/80 mb-2">Audio</p>
                  <p className="text-white/80 text-[14px]">MP3 · AAC · M4A · WAV · AIFF · FLAC · ALAC</p>
                </div>
                <div className="rounded-xl glass p-4">
                  <p className="text-[12px] uppercase tracking-wider text-aurora-mint/80 mb-2">Video</p>
                  <p className="text-white/80 text-[14px]">MP4 · M4V · MOV · H.264 · H.265 · ProRes</p>
                </div>
              </div>
            </Section>

            <Section id="troubleshooting" title="Troubleshooting">
              <Trouble
                q="A file won't play"
                a="If QuickTime Player won't play it either, AVFoundation doesn't support that codec. Re-encode with HandBrake or ffmpeg."
              />
              <Trouble
                q="Playlist didn't restore after restart"
                a="State is saved every 5 seconds during playback and on quit. A force-quit before any media has loaded can drop state. Open one file, let it play briefly, then quit normally."
              />
              <Trouble
                q="App won't open after first download"
                a="macOS Gatekeeper. Right-click the app in Applications, choose Open, then confirm the prompt. You only do this once."
              />
              <Trouble
                q="Window position lost"
                a="Move/resize the window once, then quit cleanly. The position writes on applicationWillTerminate."
              />
            </Section>

            <Section id="privacy" title="State & Privacy">
              <p>
                RE:play stores no analytics. The app has no network code. Two locations hold state:
              </p>
              <ul className="space-y-2 text-white/65 pl-1">
                <li>
                  <code className="text-aurora-mint">~/Library/Application Support/Replay/</code> —
                  playlist JSON with security-scoped bookmarks so paths survive restart.
                </li>
                <li>
                  <code className="text-aurora-mint">UserDefaults</code> — volume, shuffle/loop state,
                  window frame.
                </li>
              </ul>
              <p>
                Delete those to fully reset the app. Uninstall by dragging RE:play.app to the Trash.
              </p>
            </Section>
          </article>
        </div>
      </div>
    </PageShell>
  );
};

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({
  id,
  title,
  children,
}) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="font-display text-2xl md:text-3xl tracking-tight text-white mb-5">{title}</h2>
    <div className="space-y-4 text-white/70 text-[15px] leading-relaxed">{children}</div>
  </section>
);

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-white/90 font-mono text-[12px]">
    {children}
  </kbd>
);

const ShortcutTable: React.FC<{ rows: [string, string][] }> = ({ rows }) => (
  <div className="rounded-2xl glass overflow-hidden">
    <table className="w-full text-[14px]">
      <tbody>
        {rows.map(([keys, desc], i) => (
          <tr
            key={i}
            className={
              "transition-colors hover:bg-white/[0.04] " +
              (i !== rows.length - 1 ? "border-b border-white/5" : "")
            }
          >
            <td className="py-3 px-5 font-mono text-aurora-mint/90 whitespace-nowrap w-[1%]">
              {keys}
            </td>
            <td className="py-3 px-5 text-white/75">{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Trouble: React.FC<{ q: string; a: string }> = ({ q, a }) => (
  <div className="rounded-xl glass p-5">
    <p className="text-white/90 font-medium text-[14px] mb-1.5">{q}</p>
    <p className="text-white/60 text-[14px] leading-relaxed">{a}</p>
  </div>
);
