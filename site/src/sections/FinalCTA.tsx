import { DownloadButton } from "../components/DownloadButton";

export const FinalCTA: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden">
      <div className="aurora-bg" />
      <div className="grain" />
      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[0.95]">
          <span className="text-white/65">Open something.</span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-white to-aurora-mint">
            Press space.
          </span>
        </h2>
        <p className="mt-6 text-white/65 text-[15px] md:text-[16px]">
          That's the whole pitch. Welcome to a media player that doesn't get
          in your way.
        </p>
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <DownloadButton large />
          <span className="text-[12px] text-white/40 mt-2 sm:mt-0 sm:ml-2">
            macOS 13+ · ~4 MB · Free
          </span>
        </div>
      </div>
    </section>
  );
};
