export const Footer: React.FC = () => {
  return (
    <footer className="relative px-6 md:px-12 py-10 border-t border-white/8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-2.5 text-[13px] text-white/55">
          <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-white to-aurora-blue" />
          <span className="font-display font-semibold text-white/85">RE:play</span>
          <span className="text-white/30">v1.0</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-white/50">
          <span>Built with SwiftUI + AVFoundation</span>
          <a className="hover:text-white/80 transition-colors" href="https://github.com/your/replay" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a className="hover:text-white/80 transition-colors" href="https://www.patreon.com/your-handle" target="_blank" rel="noreferrer">Patreon ↗</a>
          <span className="text-white/30">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};
