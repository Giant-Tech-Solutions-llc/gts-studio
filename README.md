# Semantic SEO Studio

A hosted web app that wraps the **koray-semantic-seo** skill — Koray Tuğberk Gübür's
topical-authority methodology — as a production tool. One selector, six stages of the
pipeline, streamed straight from Claude.

| # | Stage | Input | Output |
|---|-------|-------|--------|
| 0 | Topical Map | seed topic + source context | JSON map (core / outer sections) |
| 1 | Entity Extraction | page title / topic | entity JSON |
| 2 | Content Blueprint | title + entity data | 10-section outline |
| 3 | Internal Linking Graph | topical map | per-page linking JSON |
| 4 | Full Article | content blueprint | rendered Markdown |
| 5 | Content Audit | content + topical map | scorecard JSON |

Output of one stage pipes into the next with a single click.

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **@anthropic-ai/sdk** — server-side only, streamed responses (Node runtime)
- **@upstash/ratelimit** + **@upstash/redis** (Vercel KV / Upstash) — rate limiting, usage logging, run history
- Auth: single shared **access code** + HMAC-signed `httpOnly` cookie, enforced in middleware

The base system prompt is built at runtime from the bundled skill (`skill/koray-semantic-seo/SKILL.md` +
`references/*.md`); each request appends the selected stage's contract from `stage-templates.md`.

## Models

- Default: `claude-sonnet-4-6`
- `claude-opus-4-8` toggle is offered **only on Stage 0 and Stage 4** (and enforced server-side).

## Local development

```bash
npm install
cp .env.example .env.local      # fill in the values below
npm run dev                     # http://localhost:3000
```

You'll be redirected to `/login`; enter the `ACCESS_CODE` you set.

### Environment variables

| Var | Required | Purpose |
|-----|----------|---------|
| `ANTHROPIC_API_KEY` | ✅ | Claude API key. Server-side only. |
| `ACCESS_CODE` | ✅ | Shared code users type on `/login`. |
| `AUTH_SECRET` | ✅ | 32+ char random string signing the session cookie. `openssl rand -base64 32`. |
| `KV_REST_API_URL` | optional | Upstash/Vercel KV REST URL. |
| `KV_REST_API_TOKEN` | optional | Upstash/Vercel KV REST token. |
| `RATE_LIMIT_PER_MINUTE` | optional | Sliding-window cap per user (default 30). |

Without the KV vars the app still runs — rate limiting and run history simply switch off
(a warning is logged). Set them for production.

### Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve the build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## API

`POST /api/run` → streamed `text/plain` completion.

```jsonc
{ "mode": 0, "input": "## Seed topic\ncreatine\n\n## Source context\n…", "model": "claude-sonnet-4-6" }
```

- Input is sanitized (control chars stripped), capped at ~8k chars, and rejected if empty.
- Transient `429`/`529` from the model are retried once with backoff.
- Errors map to clean user messages; stack traces are never returned.
- `429` responses carry a `Retry-After` header.

Other routes: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/history`.

## Deploy to Vercel

1. Push this repo to GitHub and **Import** it in the Vercel dashboard (framework auto-detected as Next.js).
2. **Storage → Create → Upstash Redis** (Vercel KV), connect it to the project. This injects
   `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
3. Add the remaining env vars (`ANTHROPIC_API_KEY`, `ACCESS_CODE`, `AUTH_SECRET`) under
   **Settings → Environment Variables** for Production (and Preview if you want it gated there too).
4. **Deploy.** `vercel.json` sets the `/api/run` function `maxDuration` to 60s for long article runs.

Or from the CLI:

```bash
npm i -g vercel
vercel link
vercel env add ANTHROPIC_API_KEY
vercel env add ACCESS_CODE
vercel env add AUTH_SECRET
vercel deploy --prod
```

> **Multi-user note:** the default gate is a single shared access code. To support distinct
> accounts, swap the middleware check for [NextAuth](https://authjs.dev) (email or OAuth) and
> set the corresponding env vars — the per-user rate-limit and history keys already key off the
> session subject, so they carry over unchanged.

## Project layout

```
app/
  api/run/route.ts        # streaming completion endpoint
  api/auth/{login,logout} # access-code session
  api/history/route.ts    # per-user run history
  login/page.tsx          # access-code gate
  page.tsx                # three-pane studio UI
components/                # ModeRail, InputForm, OutputPane, JsonView, MarkdownView, …
lib/                       # stages, skill prompt builder, anthropic, auth, kv, ratelimit, usage
skill/koray-semantic-seo/  # bundled skill markdown (base system prompt source)
middleware.ts              # auth gate
vercel.json                # function maxDuration
```

## Security

- `ANTHROPIC_API_KEY` is read only on the server; it is never sent to the client.
- All app routes are gated by middleware; API routes return `401` JSON, pages redirect to `/login`.
- Session cookie is `httpOnly`, `SameSite=Lax`, `Secure` in production, HMAC-signed.
- Usage logs store the random session subject, mode, token counts, and timestamps — **no PII**.
- No secrets are committed; `.env*` files are git-ignored.
