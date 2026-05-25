import { Footer } from "../sections/Footer";

export const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <main id="top" className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-ink -z-10" />
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="aurora-bg" />
        <div className="aurora-bg secondary" />
      </div>
      <div className="scan-overlay -z-10" />
      <div className="grain -z-10" />

      <div className="relative z-10 flex-1">{children}</div>

      <Footer />
    </main>
  );
};
