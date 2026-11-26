# Deploy plan: Cloudflare Workers with OpenNext

> Owner request (2026-11-26): deploy to **Cloudflare Workers** with **OpenNext** (`@opennextjs/cloudflare`). Repo: `https://github.com/mt-learns/mengty-learns.git`. Domain: a subdomain of **limmengty.com**.
> This replaces the README's "Cloudflare Pages, from `out/`" deploy section.

## 1. Decisions

| # | Decision | Why / trade-off |
|---|---|---|
| D1 | **OpenNext on Workers** (owner's choice), not Pages and not vinext | OpenNext supports every Next.js 16 minor. Cloudflare now recommends vinext for *new* apps, but this is an existing Next 16 + Fumadocs app and the owner chose OpenNext. Cost: a Worker bundle (≤ 3 MiB gzip on the free plan) instead of plain files. Benefit: room to grow (ISR, route handlers, middleware) with no host change later |
| D2 | **Drop `output: 'export'`**, keep every page pre-rendered (SSG) | OpenNext transforms a normal `next build`; static export isn't a supported input. All routes stay static via `generateStaticParams` / `dynamic = 'force-static'`, so behaviour doesn't change for visitors |
| D3 | **Incremental cache: read-only Workers Static Assets** (`staticAssetsIncrementalCache`, `enableCacheInterception: true`) | The OpenNext docs: "If your site is static, you do not need a Queue nor a Tag Cache." No R2, KV, D1 or Durable Objects means $0 and nothing to operate. Revisit when we add ISR/revalidation |
| D4 | **Images stay `unoptimized: true`**, with no `IMAGES` binding | All images are local SVG/PNG. Cloudflare Images would add cost and isn't needed. Verify in the build that `next/image` doesn't need the binding |
| D5 | **Deploy from GitHub Actions on Linux**, not from Windows | OpenNext says Windows "full support is not guaranteed". CI already runs lint/test/build; deploy becomes the last job, gated on them. PRs get a preview *version* URL (`wrangler versions upload`); `main` deploys |
| D6 | **Custom domain `learn.limmengty.com`** (default; the owner may change the subdomain in one place: `wrangler.jsonc`) via a Workers **custom domain** route | Cloudflare manages DNS and the certificate automatically. Needs the `limmengty.com` zone in the same Cloudflare account. `workers.dev` stays enabled for previews |
| D7 | **Security and caching headers via `public/_headers`** | Static assets are served before the Worker runs, so `next.config` `headers()` doesn't apply to them. One file covers immutable caching for `/_next/static/*` plus CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy and frame-ancestors (it closes the content audit's "does this site have headers?" gap) |

## 2. Owner tasks (only you can do these)

| # | Task | Notes |
|---|---|---|
| O1 | Make sure `limmengty.com` is an **active zone** in your Cloudflare account (nameservers point to Cloudflare) | Needed for the custom domain |
| O2 | Create a Cloudflare **API token**: template "Edit Cloudflare Workers", scoped to your account and the `limmengty.com` zone | Permissions: Workers Scripts Edit, Workers Routes Edit, Account Settings Read, Zone Read. Never commit it |
| O3 | In GitHub repo `mt-learns/mengty-learns` → Settings → Secrets and variables → Actions, add **`CLOUDFLARE_API_TOKEN`** and **`CLOUDFLARE_ACCOUNT_ID`** | The account ID is on the Workers dashboard sidebar |
| O4 | Confirm the subdomain (`learn.limmengty.com`?) | One-line change if it should be different |
| O5 | Allow the lead to **push `main`** to the repo (first push) | Workers never push. The lead pushes only after review |

## 3. Implementation (worker: Claude, worktree `deploy-cloudflare`)

One commit per step. No trailers, no push.

1. **`build(deploy): add opennext cloudflare adapter`**
   - `pnpm add @opennextjs/cloudflare@latest` and `pnpm add -D wrangler@latest` (≥ 3.99). Record the exact versions in the README "Tested with" table.
   - `open-next.config.ts` with `staticAssetsIncrementalCache` + `enableCacheInterception: true` (D3).
   - `wrangler.jsonc`:
     - `name: "mengty-learns"`, `main: ".open-next/worker.js"`.
     - `compatibility_date`: today, `compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"]`.
     - `assets: { directory: ".open-next/assets", binding: "ASSETS" }`.
     - `services: [{ binding: "WORKER_SELF_REFERENCE", service: "mengty-learns" }]`.
     - `routes: [{ pattern: "learn.limmengty.com", custom_domain: true }]`.
     - `workers_dev: true`, `observability: { enabled: true }`.
   - `next.config.mjs`: remove `output: 'export'`, keep `trailingSlash` and `images.unoptimized`, and add `initOpenNextCloudflareForDev()`.
   - Scripts: `preview`, `deploy`, `upload`, `cf-typegen` (from the OpenNext docs). `build` stays `build-cards && next build`.
   - `.gitignore`: `.open-next`, `.wrangler`, `.dev.vars`.
2. **`refactor(build): static routes without output export`**
   - Make sure every route still prerenders: docs `[[...slug]]`, digest `[slug]`, `digest/rss.xml`, the Fumadocs static search route, sitemap/robots and the 404 page. Each needs `generateStaticParams` / `dynamic = 'force-static'` / `revalidate = false` where required.
   - The `next build` output must show **every route as ○ or ● (static/SSG), with no λ**. Paste the route table into the report.
   - Delete `scripts/flatten-rsc.mjs`: it patched `out/` for static export, and the RSC files are now served by the Worker. Prove with a browser check that there are no 404s for `__next.*.txt` in the console.
3. **`chore(qa): run quality scripts against the worker preview`**
   - `qa-shots.mjs`, `qa-axe.mjs`, `qa-diagrams.mjs` and `lighthouserc.json` currently serve `out/`. Switch them to a running `opennextjs-cloudflare preview` (wrangler dev at a known port), or a `--url` argument. Update `quality.yml` the same way.
4. **`feat(security): headers and cache rules`**
   - `public/_headers`:
     - `/_next/static/*` immutable, 1 year.
     - Site-wide `Content-Security-Policy`, kept as strict as the app allows: test it. Next inline scripts need either `'unsafe-inline'` for scripts or a hash/nonce strategy. Document the choice honestly in the report and in `content/docs/security/security-headers.mdx` if that page exists by then.
     - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (no `preload` until the owner decides).
     - `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy` that turns off camera/mic/geolocation, and `frame-ancestors 'none'`.
   - Verify with `curl -I` against the preview. Every page must render with **0 CSP violations in the console**.
5. **`ci(deploy): deploy to cloudflare workers`**
   - New `.github/workflows/deploy.yml`. Every action is pinned by full SHA with a `# vX` comment, and the workflow sets `permissions: contents: read`.
   - Jobs: install → lint/typecheck/test → `opennextjs-cloudflare build` → on `pull_request`: `opennextjs-cloudflare upload` (preview version, URL posted as a job summary) → on push to `main`: `opennextjs-cloudflare deploy`.
   - Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. `concurrency: deploy-production` so deploys never overlap.
   - Rollback: document `wrangler rollback` and dashboard → Deployments.
6. **`docs(deploy): readme and runbook`**
   - README "Deploy" section rewritten.
   - `docs/deploy/RUNBOOK.md`: first deploy, custom-domain check, rollback, rotating the token, reading Workers logs, and the free-plan size limit (3 MiB gzip, which `wrangler deploy` prints).

### Verification (worker must show evidence)
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` and `pnpm preview` all green locally. **If the OpenNext build fails on Windows**, try WSL (if installed) and otherwise say so. CI on Ubuntu is the source of truth, but the worker must still prove the config with a local `wrangler dev` or a WSL build.
- The route table shows only static routes. The gzip worker size is reported and under 3 MiB.
- On the preview: `/`, `/docs/`, a concept page with a flow, `/review/`, `/radar/`, `/digest/rss.xml`, the search (Ctrl+K returns results) and 404 all work. Take screenshots at 360/1280.
- `curl -I` shows the headers. axe shows 0 serious issues. No console errors.
- **No secrets in the repo** (`git grep -nE "CLOUDFLARE_API_TOKEN=|[A-Za-z0-9_-]{40}"` returns only workflow references).

## 4. Lead steps after merge
1. Review the evidence, merge `deploy-cloudflare` → `main`, and delete the worktree.
2. With the owner's OK (O5): `git remote add origin https://github.com/mt-learns/mengty-learns.git` and `git push -u origin main`.
3. Watch the first `deploy.yml` run. Check `https://mengty-learns.<account>.workers.dev` and then `https://learn.limmengty.com`, with headers via `curl -I` and Lighthouse on production.
4. Turn on branch protection for `main` (required checks: ci, quality, deploy-preview).

## 5. Risks

| Risk | Mitigation |
|---|---|
| A route silently becomes dynamic (λ) once export mode is off | Step 2 makes the static route table a gate; also add a CI check that fails on λ |
| A strict CSP breaks Next hydration, the theme script or search | Test every route in the preview with the console open. Loosen only what's measured, and document why |
| The OpenNext build is unreliable on Windows | Build and deploy happen in Linux CI. Locally, use `next dev` plus WSL for `preview` |
| Worker size over 3 MiB (free plan) | The content is mostly static assets (not counted in the Worker). Report the gzip size in CI and fail at 2.5 MiB as an early warning |
| Fumadocs static search relies on export behaviour | Verify Ctrl+K on the preview and production |
