# replay-feedback worker

Cloudflare Worker that receives feedback submissions from
`replay.cyburdine.com/feature-request` and:

1. Verifies a Cloudflare Turnstile token.
2. Uploads any screenshot to an R2 bucket and resolves a public URL.
3. Creates a GitHub issue (label `bug` or `enhancement`) on `cyburdine/REplay`.
4. Posts a Slack notification via incoming webhook.

## One-time setup

```sh
cd worker
npm install
npx wrangler login

# Create the R2 bucket once
npx wrangler r2 bucket create replay-feedback-screenshots
npx wrangler r2 bucket create replay-feedback-screenshots-preview

# Set secrets (you'll be prompted for each value)
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put SLACK_WEBHOOK_URL
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put SCREENSHOT_PUBLIC_BASE

# Update wrangler.toml with the Turnstile site key (public — safe to commit)
# Then deploy
npx wrangler deploy
```

The route `replay.cyburdine.com/api/feedback` is declared in
`wrangler.toml`; Cloudflare picks it up on deploy and intercepts that
path before it reaches the nginx origin.

## Local dev

```sh
npm run dev   # wrangler dev with secrets read from .dev.vars
```

Create `.dev.vars` (gitignored) with the same secret names for local
testing.
