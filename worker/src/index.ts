interface Env {
  GITHUB_REPO: string;
  GITHUB_TOKEN: string;
  SLACK_WEBHOOK_URL: string;
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  SCREENSHOTS: R2Bucket;
  SCREENSHOT_PUBLIC_BASE: string;
}

type Kind = "bug" | "feature";

interface Submission {
  kind: Kind;
  title: string;
  description: string;
  name: string;
  email: string;
  expectedBehavior: string;
  actualBehavior: string;
  macOSVersion: string;
  replayVersion: string;
  screenshot: File | null;
  turnstileToken: string;
}

const MAX_FIELD_LEN = 8000;
const MAX_SCREENSHOT_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "https://replay.cyburdine.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (request.method !== "POST") {
      return json({ error: "method not allowed" }, 405);
    }

    try {
      const form = await request.formData();
      const submission = parseSubmission(form);
      const validation = validate(submission);
      if (validation) return json({ error: validation }, 400);

      const clientIp = request.headers.get("CF-Connecting-IP") ?? "";
      const turnstileOk = await verifyTurnstile(
        submission.turnstileToken,
        env.TURNSTILE_SECRET_KEY,
        clientIp,
      );
      if (!turnstileOk) return json({ error: "captcha verification failed" }, 400);

      let screenshotUrl: string | null = null;
      if (submission.screenshot) {
        screenshotUrl = await uploadScreenshot(submission.screenshot, env);
      }

      const issueUrl = await createGitHubIssue(submission, screenshotUrl, env);
      // Slack ping is best-effort — don't fail the user-facing request if it errors.
      await notifySlack(submission, issueUrl, screenshotUrl, env).catch((err) =>
        console.error("slack notify failed", err),
      );

      return json({ ok: true, issueUrl }, 200);
    } catch (err) {
      console.error("feedback handler error", err);
      const message = err instanceof Error ? err.message : "internal error";
      return json({ error: message }, 500);
    }
  },
} satisfies ExportedHandler<Env>;

function parseSubmission(form: FormData): Submission {
  const get = (key: string) => String(form.get(key) ?? "").trim();
  const screenshotRaw = form.get("screenshot");
  const file =
    screenshotRaw && typeof screenshotRaw === "object"
      ? (screenshotRaw as unknown as File)
      : null;
  const screenshot = file && file.size > 0 ? file : null;
  return {
    kind: (get("kind") === "bug" ? "bug" : "feature") as Kind,
    title: get("title"),
    description: get("description"),
    name: get("name"),
    email: get("email"),
    expectedBehavior: get("expectedBehavior"),
    actualBehavior: get("actualBehavior"),
    macOSVersion: get("macOSVersion"),
    replayVersion: get("replayVersion"),
    screenshot,
    turnstileToken: get("turnstileToken"),
  };
}

function validate(s: Submission): string | null {
  if (!s.turnstileToken) return "missing captcha token";
  if (!s.title) return "title is required";
  if (!s.description) return "description is required";
  if (s.title.length > 200) return "title too long";
  for (const [k, v] of Object.entries(s)) {
    if (typeof v === "string" && v.length > MAX_FIELD_LEN) return `${k} too long`;
  }
  if (s.email && !s.email.includes("@")) return "invalid email";
  if (s.screenshot) {
    if (s.screenshot.size > MAX_SCREENSHOT_BYTES) return "screenshot too large (max 10 MB)";
    if (!ALLOWED_IMAGE_TYPES.has(s.screenshot.type)) return "screenshot must be png/jpg/gif/webp";
  }
  return null;
}

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

async function uploadScreenshot(file: File, env: Env): Promise<string> {
  const ext = extensionFor(file.type);
  const key = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  await env.SCREENSHOTS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });
  const base = env.SCREENSHOT_PUBLIC_BASE.replace(/\/$/, "");
  return `${base}/${key}`;
}

function extensionFor(mime: string): string {
  switch (mime) {
    case "image/png": return ".png";
    case "image/jpeg": return ".jpg";
    case "image/gif": return ".gif";
    case "image/webp": return ".webp";
    default: return "";
  }
}

async function createGitHubIssue(
  s: Submission,
  screenshotUrl: string | null,
  env: Env,
): Promise<string> {
  const label = s.kind === "bug" ? "bug" : "enhancement";
  const titlePrefix = s.kind === "bug" ? "[Bug] " : "[Feature] ";
  const title = `${titlePrefix}${s.title}`.slice(0, 256);
  const body = renderIssueBody(s, screenshotUrl);

  const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "replay-feedback-worker",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body, labels: [label] }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`github issue create failed: ${res.status} ${errText}`);
  }

  const data = (await res.json()) as { html_url: string };
  return data.html_url;
}

function renderIssueBody(s: Submission, screenshotUrl: string | null): string {
  const lines: string[] = [];

  lines.push(s.description);
  lines.push("");

  if (s.kind === "bug") {
    if (s.expectedBehavior) {
      lines.push("### Expected behavior");
      lines.push(s.expectedBehavior);
      lines.push("");
    }
    if (s.actualBehavior) {
      lines.push("### Actual behavior");
      lines.push(s.actualBehavior);
      lines.push("");
    }

    const envBits: string[] = [];
    if (s.macOSVersion) envBits.push(`- **macOS**: ${s.macOSVersion}`);
    if (s.replayVersion) envBits.push(`- **REplay**: ${s.replayVersion}`);
    if (envBits.length) {
      lines.push("### Environment");
      lines.push(...envBits);
      lines.push("");
    }
  }

  if (screenshotUrl) {
    lines.push("### Screenshot");
    lines.push(`![screenshot](${screenshotUrl})`);
    lines.push("");
  }

  const meta: string[] = [];
  if (s.name) meta.push(`Submitted by: ${s.name}`);
  if (s.email) meta.push(`Reply-to: ${s.email}`);
  meta.push("Submitted via replay.cyburdine.com/feature-request");
  lines.push("---");
  lines.push(meta.map((line) => `_${line}_`).join("  \n"));

  return lines.join("\n");
}

async function notifySlack(
  s: Submission,
  issueUrl: string,
  screenshotUrl: string | null,
  env: Env,
): Promise<void> {
  const icon = s.kind === "bug" ? ":beetle:" : ":sparkles:";
  const kindLabel = s.kind === "bug" ? "Bug report" : "Feature request";
  const author = s.name || s.email || "anonymous";
  const summary = s.description.length > 280 ? s.description.slice(0, 277) + "..." : s.description;

  const blocks: unknown[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `${icon} New ${kindLabel.toLowerCase()}` },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*<${issueUrl}|${s.title}>*\n${summary}` },
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `From: ${author}` },
        ...(s.kind === "bug" && (s.macOSVersion || s.replayVersion)
          ? [
              {
                type: "mrkdwn",
                text: `macOS ${s.macOSVersion || "?"} · REplay ${s.replayVersion || "?"}`,
              },
            ]
          : []),
      ],
    },
  ];

  if (screenshotUrl) {
    blocks.push({
      type: "image",
      image_url: screenshotUrl,
      alt_text: "screenshot",
    });
  }

  const res = await fetch(env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `${kindLabel}: ${s.title}`,
      blocks,
    }),
  });

  if (!res.ok) throw new Error(`slack webhook failed: ${res.status}`);
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}
