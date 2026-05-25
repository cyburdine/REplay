export const Footer: React.FC = () => {
  return (
    <footer className="relative px-6 md:px-12 py-10 border-t border-white/8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-3 text-[13px] text-white/55">
          <img
            src="/logo-wordmark.png"
            alt="RE:play"
            className="h-6 w-auto select-none opacity-90"
            draggable={false}
          />
          <span className="text-white/30">v1.0</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-white/50">
          <span>Built with SwiftUI + AVFoundation</span>
          <a className="hover:text-white/80 transition-colors" href="https://github.com/cyburdine/REplay" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a className="hover:text-white/80 transition-colors" href="https://github.com/sponsors/cyburdine" target="_blank" rel="noreferrer">Sponsor ↗</a>
          <span className="text-white/30">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};
