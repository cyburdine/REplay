import { Hero } from "./sections/Hero";
import { LivePlayer } from "./sections/LivePlayer";
import { Features } from "./sections/Features";
import { Formats } from "./sections/Formats";
import { Shortcuts } from "./sections/Shortcuts";
import { Support } from "./sections/Support";
import { FinalCTA } from "./sections/FinalCTA";
import { Footer } from "./sections/Footer";

export default function App() {
  return (
    <main className="relative">
      <Hero />
      <LivePlayer />
      <Features />
      <Formats />
      <Shortcuts />
      <Support />
      <FinalCTA />
      <Footer />
    </main>
  );
}
