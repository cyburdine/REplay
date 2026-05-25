import { useEffect, useRef, useState } from "react";
import { PageShell } from "../components/PageShell";

type Kind = "bug" | "feature";

const API_ENDPOINT =
  (import.meta.env.VITE_FEEDBACK_API as string | undefined) ??
  "/api/feedback";

// Public-by-design — Turnstile site keys live in the browser bundle. The secret
// key (in the Worker) is what actually verifies tokens.
const TURNSTILE_SITE_KEY =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ??
  "0x4AAAAAADWIZf-x9v-AzNZ5";

export const FeatureRequest: React.FC = () => {
  // Only state that actually needs React: things that drive conditional UI.
  // Text inputs are uncontrolled — we read them from the <form> on submit.
  const [kind, setKind] = useState<Kind>("feature");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [result, setResult] = useState<
    | { status: "idle" }
    | { status: "success"; issueUrl: string }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const turnstileTokenRef = useRef<string>("");

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    const scriptId = "cf-turnstile-script";
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }

    const tryRender = () => {
      const ts = (window as Window & { turnstile?: TurnstileApi }).turnstile;
      if (!ts || !turnstileRef.current || turnstileWidgetId.current) return false;
      turnstileWidgetId.current = ts.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          turnstileTokenRef.current = token;
        },
        "error-callback": () => {
          turnstileTokenRef.current = "";
        },
        "expired-callback": () => {
          turnstileTokenRef.current = "";
        },
      });
      return true;
    };

    if (!tryRender()) {
      const id = setInterval(() => {
        if (tryRender()) clearInterval(id);
      }, 200);
      return () => clearInterval(id);
    }
  }, []);

  function resetTurnstile() {
    const ts = (window as Window & { turnstile?: TurnstileApi }).turnstile;
    if (ts && turnstileWidgetId.current) {
      ts.reset(turnstileWidgetId.current);
      turnstileTokenRef.current = "";
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setResult({ status: "idle" });
    setSubmitting(true);

    try {
      const formEl = e.currentTarget;
      const data = new FormData(formEl);

      // FormData captures every named input, including kind (radio), the file
      // input, and the bug-only fields. The bug-only fields are still in the
      // DOM when the form is in feature mode (just hidden), but they're empty,
      // and the Worker only uses them when kind === "bug".
      data.set("kind", kind);
      if (screenshot) data.set("screenshot", screenshot);
      else data.delete("screenshot");
      data.set("turnstileToken", turnstileTokenRef.current);

      // Cheap client-side guards so we don't round-trip on obvious misses.
      const title = String(data.get("title") ?? "").trim();
      const description = String(data.get("description") ?? "").trim();
      if (!title) throw new Error("Title is required");
      if (!description) throw new Error("Description is required");
      if (TURNSTILE_SITE_KEY && !turnstileTokenRef.current) {
        throw new Error("Please complete the captcha before submitting");
      }

      const res = await fetch(API_ENDPOINT, { method: "POST", body: data });
      const json = (await res.json()) as { ok?: boolean; issueUrl?: string; error?: string };

      if (!res.ok || !json.ok || !json.issueUrl) {
        throw new Error(json.error ?? `Server returned ${res.status}`);
      }
      setResult({ status: "success", issueUrl: json.issueUrl });
      formEl.reset();
      setScreenshot(null);
      setFormKey((k) => k + 1);
      resetTurnstile();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed";
      setResult({ status: "error", message });
      resetTurnstile();
    } finally {
      setSubmitting(false);
    }
  }

  if (result.status === "success") {
    return (
      <PageShell>
        <SuccessPanel
          kind={kind}
          issueUrl={result.issueUrl}
          onReset={() => setResult({ status: "idle" })}
        />
      </PageShell>
    );
  }

  const isBug = kind === "bug";

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-24">
        <div className="mb-12 max-w-3xl">
          <p className="text-[12px] tracking-[0.2em] uppercase text-aurora-mint/80 mb-4">
            Feedback
          </p>
          <h1 className="font-display text-4xl md:text-6xl tracking-[-0.025em] leading-[0.95]">
            <span className="font-light text-white/85">Found a bug?</span>{" "}
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white to-aurora-mint">
              Tell us.
            </span>
          </h1>
          <p className="mt-6 text-white/65 text-[15px] md:text-[17px] leading-relaxed">
            One form for bugs and feature requests. Submissions create a GitHub
            issue automatically and notify the maintainer in Slack.
          </p>
        </div>

        <form
          key={formKey}
          ref={formRef}
          onSubmit={submit}
          className="p-6 md:p-8 rounded-2xl glass space-y-6"
          encType="multipart/form-data"
          noValidate
        >
          <KindToggle value={kind} onChange={setKind} />

          <Field
            label="Title"
            name="title"
            placeholder={
              isBug ? "Short summary of the bug" : "Short summary of the feature"
            }
            required
          />

          <FieldArea
            label={isBug ? "What happened?" : "What should RE:play do?"}
            name="description"
            placeholder={
              isBug
                ? "Describe the problem. Include what you did right before it happened."
                : "Be as specific as you like — the goal, what's missing, what would make it click."
            }
            required
          />

          {/* Bug-only fields stay mounted (just hidden) so toggling kind is a
              CSS show/hide, not a remount. Way less layout work. */}
          <div className={isBug ? "space-y-6" : "hidden"} aria-hidden={!isBug}>
            <div className="grid md:grid-cols-2 gap-4">
              <FieldArea
                label="Expected behavior"
                name="expectedBehavior"
                placeholder="What you thought would happen"
                rows={3}
              />
              <FieldArea
                label="Actual behavior"
                name="actualBehavior"
                placeholder="What actually happened"
                rows={3}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field
                label="macOS version"
                name="macOSVersion"
                placeholder="e.g. 14.2.1 (Sonoma)"
              />
              <Field
                label="REplay version"
                name="replayVersion"
                placeholder="see About → RE:play"
              />
            </div>
            <ScreenshotField file={screenshot} onChange={setScreenshot} />
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <Field
              label="Your name"
              name="name"
              placeholder="Optional"
              autoComplete="name"
            />
            <Field
              label="Email (for reply)"
              name="email"
              placeholder="Optional, you@example.com"
              type="email"
              autoComplete="email"
            />
          </div>

          {TURNSTILE_SITE_KEY && (
            <div>
              <div ref={turnstileRef} className="cf-turnstile" />
            </div>
          )}

          {result.status === "error" && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-200">
              {result.message}
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className={
                "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-medium transition-all " +
                (submitting
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-aurora-mint text-ink hover:bg-aurora-mint/90")
              }
            >
              {submitting
                ? "Submitting…"
                : isBug
                  ? "Submit bug report"
                  : "Submit feature request"}
              {!submitting && <span aria-hidden>→</span>}
            </button>
            <p className="text-white/40 text-[12px]">
              Creates a public issue · maintainer notified in Slack
            </p>
          </div>
        </form>

        <div className="mt-12 grid md:grid-cols-3 gap-3">
          <Tip
            title="One thing per submission"
            detail="Easier to triage and ship. Submit twice if you have two unrelated issues."
          />
          <Tip
            title="Lead with the goal"
            detail="The 'why' often points to a cleaner solution than the 'how'."
          />
          <Tip
            title="Screenshots help"
            detail="A picture of where you saw it (or where you'd want it) saves a lot of back-and-forth."
          />
        </div>
      </div>
    </PageShell>
  );
};

const SuccessPanel: React.FC<{
  kind: Kind;
  issueUrl: string;
  onReset: () => void;
}> = ({ kind, issueUrl, onReset }) => (
  <div className="max-w-3xl mx-auto px-6 md:px-10 pt-24 pb-24 text-center">
    <p className="text-[12px] tracking-[0.2em] uppercase text-aurora-mint/80 mb-4">
      Submitted
    </p>
    <h1 className="font-display text-4xl md:text-6xl tracking-[-0.025em] leading-[0.95] mb-6">
      <span className="font-light text-white/85">Got it.</span>{" "}
      <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-br from-white to-aurora-mint">
        Thanks.
      </span>
    </h1>
    <p className="text-white/65 text-[16px] mb-8 max-w-xl mx-auto">
      Your {kind === "bug" ? "bug report" : "feature request"} is now a tracked
      issue on GitHub. The maintainer has been pinged in Slack.
    </p>
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <a
        href={issueUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-ink text-[14px] font-medium hover:bg-white/90 transition-colors"
      >
        View issue on GitHub ↗
      </a>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass text-[14px] text-white/90 hover:text-white hover:bg-white/10 transition-colors"
      >
        Submit another
      </button>
    </div>
  </div>
);

const KindToggle: React.FC<{ value: Kind; onChange: (v: Kind) => void }> = ({
  value,
  onChange,
}) => (
  <div
    role="tablist"
    className="inline-flex p-1 rounded-xl bg-white/[0.04] border border-white/10"
  >
    {(["feature", "bug"] as const).map((k) => {
      const active = value === k;
      return (
        <button
          key={k}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(k)}
          className={
            "px-4 py-2 rounded-lg text-[13px] font-medium transition-colors " +
            (active
              ? "bg-white text-ink shadow-sm"
              : "text-white/65 hover:text-white")
          }
        >
          {k === "feature" ? "✨ Feature request" : "🐞 Bug report"}
        </button>
      );
    })}
  </div>
);

const Field: React.FC<{
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}> = ({ label, name, placeholder, type = "text", autoComplete, required }) => (
  <label className="flex flex-col gap-2">
    <span className="text-[12px] uppercase tracking-[0.14em] text-white/50">
      {label}
      {required && <span className="text-aurora-mint/80"> *</span>}
    </span>
    <input
      type={type}
      name={name}
      defaultValue=""
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-aurora-mint/60 focus:bg-white/[0.06] outline-none text-white/95 text-[14px] placeholder:text-white/30"
    />
  </label>
);

const FieldArea: React.FC<{
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}> = ({ label, name, placeholder, rows = 6, required }) => (
  <label className="flex flex-col gap-2">
    <span className="text-[12px] uppercase tracking-[0.14em] text-white/50">
      {label}
      {required && <span className="text-aurora-mint/80"> *</span>}
    </span>
    <textarea
      name={name}
      defaultValue=""
      placeholder={placeholder}
      rows={rows}
      className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-aurora-mint/60 focus:bg-white/[0.06] outline-none text-white/95 text-[14px] placeholder:text-white/30 resize-y leading-relaxed"
    />
  </label>
);

const ScreenshotField: React.FC<{
  file: File | null;
  onChange: (f: File | null) => void;
}> = ({ file, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] uppercase tracking-[0.14em] text-white/50">
        Screenshot (optional, max 10 MB)
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="hidden"
      />
      {file && preview ? (
        <div className="rounded-xl glass p-3 flex items-center gap-4">
          <img
            src={preview}
            alt="screenshot preview"
            className="w-20 h-20 object-cover rounded-lg border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-white/90 truncate">{file.name}</p>
            <p className="text-[12px] text-white/50">
              {(file.size / 1024).toFixed(0)} KB · {file.type}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[12px] text-white/60 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl glass px-5 py-4 text-[14px] text-white/70 hover:text-white hover:bg-white/[0.06] text-left"
        >
          + Attach a screenshot
        </button>
      )}
    </div>
  );
};

const Tip: React.FC<{ title: string; detail: string }> = ({ title, detail }) => (
  <div className="p-5 rounded-xl glass">
    <p className="text-white/85 font-medium text-[13px]">{title}</p>
    <p className="text-white/55 text-[13px] mt-1.5 leading-relaxed">{detail}</p>
  </div>
);

interface TurnstileApi {
  render: (
    container: HTMLElement,
    opts: {
      sitekey: string;
      callback?: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
}
