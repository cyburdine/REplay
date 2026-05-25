import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../components/PageShell";

const QUESTIONS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What is RE:play?",
    a: "A lightweight, native macOS media player built with SwiftUI and AVFoundation. Zero third-party dependencies, ~4 MB on disk, plays anything AVFoundation speaks.",
  },
  {
    q: "What macOS versions are supported?",
    a: "macOS 13 Ventura or later. Both Apple Silicon and Intel Macs work — universal binary.",
  },
  {
    q: "Which formats does it play?",
    a: "Whatever AVFoundation supports natively: MP3, AAC, M4A, WAV, AIFF, FLAC, ALAC for audio; MP4, M4V, MOV with H.264, H.265/HEVC, ProRes for video.",
  },
  {
    q: "Where does RE:play store my playlist and settings?",
    a: (
      <>
        Playlist state lives in <code className="text-aurora-mint">~/Library/Application Support/Replay/</code> as
        a small JSON file. Window position, volume, and shuffle/loop preferences use{" "}
        <code className="text-aurora-mint">UserDefaults</code>. Nothing leaves your machine.
      </>
    ),
  },
  {
    q: "Does it phone home or collect analytics?",
    a: "No. There is no network code. RE:play does not connect to the internet for any reason.",
  },
  {
    q: "Why is it free?",
    a: (
      <>
        Because it should be. If you want to support continued development,{" "}
        <Link to="/donate" className="text-aurora-mint hover:underline">
          a donation
        </Link>{" "}
        is appreciated but never expected.
      </>
    ),
  },
  {
    q: "Can I open files directly from Finder?",
    a: "Yes — right-click any supported media file and choose Open With → RE:play. You can also drag and drop files or folders onto the app window or Dock icon.",
  },
  {
    q: "Is it open source?",
    a: (
      <>
        Yes.{" "}
        <a
          href="https://github.com/cyburdine/REplay"
          target="_blank"
          rel="noreferrer"
          className="text-aurora-mint hover:underline"
        >
          github.com/cyburdine/REplay
        </a>
        . PRs and issues welcome.
      </>
    ),
  },
];

export const FAQ: React.FC = () => {
  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-24">
        <div className="mb-12 md:mb-16">
          <p className="text-[12px] tracking-[0.2em] uppercase text-aurora-mint/80 mb-4">FAQ</p>
          <h1 className="font-display text-4xl md:text-6xl tracking-[-0.025em] leading-[0.95]">
            <span className="font-light text-white/85">Questions,</span>{" "}
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white to-aurora-mint">
              answered.
            </span>
          </h1>
          <p className="mt-6 text-white/65 text-[15px] md:text-[17px] leading-relaxed max-w-xl">
            Everything you might wonder about RE:play. If your question isn't here, file an issue on
            GitHub.
          </p>
        </div>

        <div className="space-y-3">
          {QUESTIONS.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} defaultOpen={i === 0} />
          ))}
        </div>

        <div className="mt-16 p-6 md:p-8 rounded-2xl glass">
          <p className="text-white/80 text-[15px]">Still stuck?</p>
          <p className="mt-1 text-white/55 text-[14px]">
            Open an issue on GitHub or send a feature request — we read everything.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://github.com/cyburdine/REplay/issues/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-[14px] text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              Open an issue ↗
            </a>
            <Link
              to="/feature-request"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-[14px] text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              Request a feature →
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

const FAQItem: React.FC<{ q: string; a: React.ReactNode; defaultOpen?: boolean }> = ({
  q,
  a,
  defaultOpen,
}) => {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-2xl glass overflow-hidden transition-colors hover:bg-white/[0.04]">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 text-left px-5 md:px-6 py-4 md:py-5"
      >
        <span className="font-display text-[16px] md:text-[18px] text-white/90 tracking-tight">
          {q}
        </span>
        <span
          className="flex-shrink-0 w-6 h-6 inline-flex items-center justify-center rounded-full border border-white/15 text-white/70 transition-transform"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          aria-hidden
        >
          +
        </span>
      </button>
      <div
        className="grid transition-all duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-5 md:px-6 pb-5 md:pb-6 text-white/65 text-[14px] md:text-[15px] leading-relaxed">
            {a}
          </div>
        </div>
      </div>
    </div>
  );
};
