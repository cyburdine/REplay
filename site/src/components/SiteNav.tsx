import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Features", to: "/#features", kind: "anchor" as const },
  { label: "Download", to: "/#top", kind: "anchor" as const },
  { label: "FAQ", to: "/faq", kind: "route" as const },
  { label: "Docs", to: "/docs", kind: "route" as const },
  { label: "Donate", to: "/donate", kind: "route" as const },
  { label: "Feature Request", to: "/feature-request", kind: "route" as const },
];

const GITHUB_URL = "https://github.com/cyburdine/REplay";

export const SiteNav: React.FC<{ transparent?: boolean }> = ({ transparent }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={
          "relative z-30 flex items-center justify-between px-6 md:px-10 py-6 " +
          (transparent ? "" : "border-b border-white/5 bg-ink/40 backdrop-blur-xl")
        }
      >
        <Link to="/" className="flex items-center group" aria-label="RE:play — home">
          <img
            src="/logo-wordmark.png"
            alt="RE:play"
            className="h-7 md:h-8 w-auto select-none transition-opacity group-hover:opacity-90"
            draggable={false}
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-[13px] text-white/65">
          {NAV_ITEMS.map((item) =>
            item.kind === "route" ? (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  "transition-colors " + (isActive ? "text-white" : "hover:text-white")
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ),
          )}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub ↗
          </a>
        </nav>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden relative z-40 inline-flex items-center justify-center w-10 h-10 rounded-lg glass hover:bg-white/10 transition-colors"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <Burger open={open} />
        </button>
      </header>

      {/* Mobile overlay */}
      <div
        className={
          "lg:hidden fixed inset-0 z-20 transition-opacity duration-300 " +
          (open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
        }
      >
        <div className="absolute inset-0 bg-ink/95 backdrop-blur-2xl" />
        <div className="absolute inset-0 aurora-bg opacity-40" />
        <nav className="relative h-full flex flex-col items-center justify-center gap-5 px-8 text-center">
          {NAV_ITEMS.map((item) =>
            item.kind === "route" ? (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  "font-display text-3xl tracking-tight transition-colors " +
                  (isActive ? "text-white" : "text-white/70 hover:text-white")
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="font-display text-3xl tracking-tight text-white/70 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ),
          )}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="font-display text-3xl tracking-tight text-white/70 hover:text-white transition-colors"
          >
            GitHub ↗
          </a>
        </nav>
      </div>
    </>
  );
};

const Burger: React.FC<{ open: boolean }> = ({ open }) => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden>
    <line
      x1="1"
      y1="2"
      x2="17"
      y2="2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      style={{
        transition: "transform 250ms ease",
        transformOrigin: "9px 2px",
        transform: open ? "translateY(5px) rotate(45deg)" : "none",
      }}
    />
    <line
      x1="1"
      y1="7"
      x2="17"
      y2="7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      style={{ transition: "opacity 200ms", opacity: open ? 0 : 1 }}
    />
    <line
      x1="1"
      y1="12"
      x2="17"
      y2="12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      style={{
        transition: "transform 250ms ease",
        transformOrigin: "9px 12px",
        transform: open ? "translateY(-5px) rotate(-45deg)" : "none",
      }}
    />
  </svg>
);
