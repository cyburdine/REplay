import { useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";

const ISSUE_URL =
  "https://github.com/cyburdine/REplay/issues/new?labels=enhancement&template=feature_request.md";

const MAILTO = "justin@cyburdine.com";

export const FeatureRequest: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(`[RE:play] Feature request: ${name || "Untitled"}`);
    const body = encodeURIComponent(
      `From: ${name || "(no name)"}\nReply-to: ${email || "(no email)"}\n\n${description || "(no description)"}`,
    );
    return `mailto:${MAILTO}?subject=${subject}&body=${body}`;
  }, [name, email, description]);

  const canSend = description.trim().length > 0;

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-24">
        <div className="mb-14 md:mb-16 max-w-3xl">
          <p className="text-[12px] tracking-[0.2em] uppercase text-aurora-mint/80 mb-4">
            Feature Request
          </p>
          <h1 className="font-display text-4xl md:text-6xl tracking-[-0.025em] leading-[0.95]">
            <span className="font-light text-white/85">Tell us what</span>{" "}
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white to-aurora-mint">
              you wish it did.
            </span>
          </h1>
          <p className="mt-6 text-white/65 text-[15px] md:text-[17px] leading-relaxed">
            Two ways to ask. GitHub is preferred — it's public, searchable, and votable. Email
            works too if you'd rather keep it private.
          </p>
        </div>

        {/* Primary CTA */}
        <a
          href={ISSUE_URL}
          target="_blank"
          rel="noreferrer"
          className="group relative block mb-10 p-6 md:p-8 rounded-2xl overflow-hidden glass-strong hover:bg-white/[0.08] transition-colors"
        >
          <div
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              background:
                "radial-gradient(80% 80% at 100% 0%, rgba(128,255,208,0.18), transparent 60%)",
            }}
          />
          <div className="relative flex items-start md:items-center justify-between gap-6 flex-col md:flex-row">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-aurora-mint/90 mb-2">
                Preferred
              </p>
              <p className="font-display text-2xl md:text-3xl tracking-tight text-white">
                Open an issue on GitHub
              </p>
              <p className="mt-2 text-white/65 text-[14px] max-w-xl">
                Pre-filled with the feature-request template. Public, so others can upvote or chime
                in.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-ink text-[14px] font-medium group-hover:gap-3 transition-all">
              Open issue
              <span aria-hidden>↗</span>
            </span>
          </div>
        </a>

        {/* Email form */}
        <div className="p-6 md:p-8 rounded-2xl glass">
          <div className="flex items-center justify-between gap-4 mb-2">
            <p className="font-display text-xl text-white/90">Or send it by email</p>
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">Private</span>
          </div>
          <p className="text-white/55 text-[14px] mb-6">
            This opens your default mail app — nothing is sent until you hit send.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Field
              label="Your name"
              value={name}
              onChange={setName}
              placeholder="Optional"
              autoComplete="name"
            />
            <Field
              label="Email (for reply)"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
            />
          </div>

          <FieldArea
            label="What should RE:play do?"
            value={description}
            onChange={setDescription}
            placeholder="Be as specific as you like — what you're trying to do, what's missing, what would make it click."
          />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={canSend ? mailtoHref : undefined}
              aria-disabled={!canSend}
              onClick={(e) => {
                if (!canSend) e.preventDefault();
              }}
              className={
                "inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium transition-all " +
                (canSend
                  ? "bg-aurora-mint text-ink hover:bg-aurora-mint/90"
                  : "bg-white/10 text-white/40 cursor-not-allowed")
              }
            >
              Send email
              <span aria-hidden>→</span>
            </a>
            <p className="text-white/40 text-[12px]">
              {canSend
                ? `Will open your mail app addressed to ${MAILTO}`
                : "Add a description to enable sending"}
            </p>
          </div>
        </div>

        {/* Etiquette */}
        <div className="mt-12 grid md:grid-cols-3 gap-3">
          <Tip
            title="One feature per request"
            detail="Easier to triage, easier to ship. Send two emails if you have two ideas."
          />
          <Tip
            title="Lead with the goal"
            detail="What are you trying to accomplish? The 'why' usually points to a better solution than the 'how'."
          />
          <Tip
            title="Screenshots help"
            detail="A picture of where you'd expect the feature to live saves a lot of back-and-forth."
          />
        </div>
      </div>
    </PageShell>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
}> = ({ label, value, onChange, placeholder, type = "text", autoComplete }) => (
  <label className="flex flex-col gap-2">
    <span className="text-[12px] uppercase tracking-[0.14em] text-white/50">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-aurora-mint/60 focus:bg-white/[0.06] outline-none text-white/95 text-[14px] placeholder:text-white/30 transition-colors"
    />
  </label>
);

const FieldArea: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <label className="flex flex-col gap-2">
    <span className="text-[12px] uppercase tracking-[0.14em] text-white/50">{label}</span>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={6}
      className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-aurora-mint/60 focus:bg-white/[0.06] outline-none text-white/95 text-[14px] placeholder:text-white/30 resize-y min-h-[140px] transition-colors leading-relaxed"
    />
  </label>
);

const Tip: React.FC<{ title: string; detail: string }> = ({ title, detail }) => (
  <div className="p-5 rounded-xl glass">
    <p className="text-white/85 font-medium text-[13px]">{title}</p>
    <p className="text-white/55 text-[13px] mt-1.5 leading-relaxed">{detail}</p>
  </div>
);
