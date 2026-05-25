import { DownloadButton } from "../components/DownloadButton";

export const FinalCTA: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden">
      <div className="aurora-bg" />
      <div className="grain" />
      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[0.95]">
          <span className="text-white/65">Finally a media player</span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-white to-aurora-mint">
            that just works.
          </span>
        </h2>
        <p className="mt-6 text-white/65 text-[15px] md:text-[16px]">
          Not trying to boil the ocean or sell you a subscription.
        </p>
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <DownloadButton large />
        </div>
      </div>
    </section>
  );
};
