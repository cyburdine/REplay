import { Link } from "react-router-dom";
import { PageShell } from "../components/PageShell";

const DONATE_ONE_TIME = "https://buymeacoffee.com/cyburdine";
const DONATE_MONTHLY = "https://github.com/sponsors/cyburdine";
const DONATE_SUSTAINING = "https://github.com/sponsors/cyburdine";

export const Donate: React.FC = () => {
  return (
    <PageShell>
      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-24">
        {/* Hero block */}
        <div className="mb-14 md:mb-20 max-w-3xl">
          <p className="text-[12px] tracking-[0.2em] uppercase text-aurora-mint/80 mb-4">
            Support RE:play
          </p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-[-0.03em] leading-[0.95]">
            <span className="font-light text-white/85">RE:play is free.</span>
            <br />
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-aurora-mint">
              You can keep it that way.
            </span>
          </h1>
          <p className="mt-7 text-white/70 text-[16px] md:text-[18px] leading-relaxed">
            RE:play has no ads, no analytics, no premium tier, no subscription. If it has earned a
            spot on your Mac, a small contribution helps keep development going — new formats,
            polish, and fixes that ship on the same terms the app does today.
          </p>
        </div>

        {/* Tiers */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-20">
          <TierCard
            label="One-time"
            amount="$5"
            description="Buy the developer a coffee. Or two."
            cta="Send once"
            href={DONATE_ONE_TIME}
          />
          <TierCard
            featured
            label="Monthly"
            amount="$3 /mo"
            description="Quiet, steady support. The kind that actually keeps things going."
            cta="Become a supporter"
            href={DONATE_MONTHLY}
          />
          <TierCard
            label="Sustaining"
            amount="$10 /mo"
            description="For folks who use RE:play every day and want to fund what's next."
            cta="Sustain RE:play"
            href={DONATE_SUSTAINING}
          />
        </div>

        {/* What it funds */}
        <div className="mb-20">
          <h2 className="font-display text-3xl md:text-4xl tracking-tight text-white mb-3">
            What donations fund
          </h2>
          <p className="text-white/60 text-[15px] mb-8 max-w-2xl">
            Plain language. No vague "supports the project" handwaving — here's the actual list.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <FundCard
              title="Apple Developer membership"
              detail="$99/year. Required to sign and notarize builds so Gatekeeper doesn't yell at you."
            />
            <FundCard
              title="Codec & format coverage"
              detail="Testing edge cases, weird containers, broken metadata. The unglamorous 20% that takes 80% of the time."
            />
            <FundCard
              title="New features"
              detail="Subtitle support, EQ, AirPlay, picture-in-picture — voted on by donors and the broader community."
            />
            <FundCard
              title="Maintenance"
              detail="Every new macOS version breaks something. Donations buy the time to fix it before you notice."
            />
          </div>
        </div>

        {/* Other ways to help */}
        <div className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl tracking-tight text-white mb-6">
            Can't donate? There's still plenty.
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            <HelpCard
              title="Star the repo"
              detail="It costs nothing and helps people find RE:play."
              cta="Star on GitHub ↗"
              href="https://github.com/cyburdine/REplay"
            />
            <HelpCard
              title="File good issues"
              detail="A clear bug report is worth more than ten vague ones."
              cta="Open an issue ↗"
              href="https://github.com/cyburdine/REplay/issues/new"
            />
            <HelpCard
              title="Tell someone"
              detail="The best marketing is a friend saying 'just use this.'"
              cta="Share RE:play"
              href="https://github.com/cyburdine/REplay"
            />
          </div>
        </div>

        {/* Footer note */}
        <div className="rounded-2xl glass p-6 md:p-8">
          <p className="text-white/80 text-[15px] leading-relaxed">
            Thank you. Genuinely. Whether you donate or just use the thing — RE:play exists because
            people care about a Mac that still feels like a Mac.
          </p>
          <p className="text-white/45 text-[13px] mt-3">
            Have a question first?{" "}
            <Link to="/faq" className="text-aurora-mint hover:underline">
              Read the FAQ
            </Link>{" "}
            or{" "}
            <Link to="/feature-request" className="text-aurora-mint hover:underline">
              tell us what you want next
            </Link>
            .
          </p>
        </div>
      </div>
    </PageShell>
  );
};

const TierCard: React.FC<{
  label: string;
  amount: string;
  description: string;
  cta: string;
  href: string;
  featured?: boolean;
}> = ({ label, amount, description, cta, href, featured }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className={
      "group relative flex flex-col p-6 md:p-7 rounded-2xl overflow-hidden transition-all duration-300 " +
      (featured
        ? "glass-strong scale-100 md:scale-[1.02] hover:scale-[1.04]"
        : "glass hover:bg-white/[0.06]")
    }
  >
    {featured && (
      <>
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 0%, rgba(255,93,200,0.3), transparent 70%)",
          }}
        />
        <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.18em] text-aurora-mint/90 px-2 py-1 rounded-full border border-aurora-mint/40 bg-aurora-mint/10">
          Most loved
        </span>
      </>
    )}
    <p className="text-[12px] uppercase tracking-[0.18em] text-white/55">{label}</p>
    <p className="font-display text-4xl md:text-5xl tracking-tight mt-2 text-white">
      {amount}
    </p>
    <p className="mt-3 text-white/65 text-[14px] leading-relaxed flex-1">{description}</p>
    <span
      className={
        "mt-6 inline-flex items-center gap-2 text-[14px] transition-colors " +
        (featured ? "text-white" : "text-white/85 group-hover:text-white")
      }
    >
      {cta}
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </span>
  </a>
);

const FundCard: React.FC<{ title: string; detail: string }> = ({ title, detail }) => (
  <div className="flex gap-4 p-5 rounded-xl glass">
    <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-aurora-mint shadow-[0_0_10px_rgba(255,93,200,0.7)]" />
    <div>
      <p className="text-white/90 font-medium text-[14px]">{title}</p>
      <p className="text-white/55 text-[13px] mt-1 leading-relaxed">{detail}</p>
    </div>
  </div>
);

const HelpCard: React.FC<{ title: string; detail: string; cta: string; href: string }> = ({
  title,
  detail,
  cta,
  href,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="group flex flex-col p-5 rounded-xl glass hover:bg-white/[0.06] transition-colors"
  >
    <p className="text-white/90 font-medium text-[14px]">{title}</p>
    <p className="text-white/55 text-[13px] mt-1.5 leading-relaxed flex-1">{detail}</p>
    <span className="mt-4 text-aurora-mint/90 text-[13px] group-hover:text-aurora-mint transition-colors">
      {cta}
    </span>
  </a>
);
