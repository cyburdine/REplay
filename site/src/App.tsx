import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Hero } from "./sections/Hero";
import { LivePlayer } from "./sections/LivePlayer";
import { Features } from "./sections/Features";
import { Formats } from "./sections/Formats";
import { Shortcuts } from "./sections/Shortcuts";
import { Support } from "./sections/Support";
import { FinalCTA } from "./sections/FinalCTA";
import { Footer } from "./sections/Footer";
import { FAQ } from "./pages/FAQ";
import { Docs } from "./pages/Docs";
import { Donate } from "./pages/Donate";
import { FeatureRequest } from "./pages/FeatureRequest";
import { SiteNav } from "./components/SiteNav";

const Landing: React.FC = () => (
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

const ScrollManager: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname, hash]);

  return null;
};

export default function App() {
  return (
    <>
      <ScrollManager />
      <SiteNav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/feature-request" element={<FeatureRequest />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  );
}
