# Runbook: Cloudflare Workers deploy

Worker `mengty-learns`, production `https://learn.limmengty.com`, deployed by `.github/workflows/deploy.yml`.
Why it is set up this way: `CLOUDFLARE-WORKERS-PLAN.md` (same folder).

Commands below that talk to Cloudflare (`wrangler rollback`, `wrangler tail`, `wrangler deployments`, `wrangler versions`) need `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in your shell environment, never in a file. Run them from Linux, macOS or WSL after `pnpm install`.

## 1. First deploy

Prerequisites (owner tasks O1–O5 in the plan):

1. `limmengty.com` is an **active zone** in the Cloudflare account that will own the Worker.
2. There is **no existing DNS record** (especially no CNAME) for `learn.limmengty.com`. Cloudflare refuses to create a custom domain over a CNAME.
3. An API token from the **"Edit Cloudflare Workers"** template, limited to that account and the `limmengty.com` zone.
4. GitHub → `mt-learns/mengty-learns` → Settings → Secrets and variables → Actions has `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (the account ID is on the Workers & Pages overview sidebar).

Then:

1. Push `main`. `deploy.yml` runs lint, typecheck, tests, `opennextjs-cloudflare build`, the static-route gate and the size gate, then `opennextjs-cloudflare deploy`.
2. The first deploy creates the Worker, enables `mengty-learns.<account-subdomain>.workers.dev`, and attaches the custom domain. Cloudflare creates the DNS record and the certificate. The certificate can take a few minutes.
3. Open the run's job summary: it lists the deployed URLs and the version ID.

## 2. Check the custom domain and headers

```bash
curl -sI https://learn.limmengty.com/ | grep -iE "^HTTP|content-security-policy|strict-transport|x-content-type|referrer-policy|permissions-policy|x-frame-options|x-opennext-cache"
curl -sI https://learn.limmengty.com/_next/static/  # any hashed file from the page: Cache-Control public, max-age=31536000, immutable
curl -s  -o /dev/null -w "%{http_code}\n" https://learn.limmengty.com/this-page-does-not-exist/   # 404
```

Expected:
- `HTTP/2 200` on `/`, with all six security headers and `x-opennext-cache: HIT`. HIT means the page came from the pre-rendered cache.
- A `/_next/static/...` file returns `Cache-Control: public, max-age=31536000, immutable`.
- In the dashboard (Workers & Pages → mengty-learns → Settings → Domains & Routes), `learn.limmengty.com` shows as a **Custom domain** and is active.
- Ctrl+K search returns results, and the browser console shows no errors or CSP reports on `/`, `/docs/`, `/review/` and `/radar/`.

Changing the subdomain: edit `routes[0].pattern` in `wrangler.jsonc`, then merge to `main`. The old custom domain stays attached until you remove it in the dashboard (Domains & Routes).

## 3. Roll back

Each deploy is a Worker **version**. Rolling back makes an older version live immediately. It does not rebuild anything.

- **Dashboard:** Workers & Pages → mengty-learns → Deployments → pick the last good version → **Rollback**.
- **CLI:**
  ```bash
  pnpm exec wrangler deployments list           # recent deployments and their version IDs
  pnpm exec wrangler rollback                   # back to the previous version
  pnpm exec wrangler rollback <version-id>      # back to a specific version
  ```

Then fix forward: revert the bad commit on `main` and let CI deploy it. Otherwise the next push re-deploys the broken code. Cloudflare keeps the 100 most recent versions.

## 4. Rotate the API token

Rotate yearly, when someone with access leaves, or straight away if the token may have leaked.

1. Cloudflare dashboard → My Profile → API Tokens → **Create token** with the same template and scope (Edit Cloudflare Workers, this account, zone `limmengty.com`).
2. GitHub → repo → Settings → Secrets and variables → Actions → update `CLOUDFLARE_API_TOKEN`.
3. Re-run the latest `Deploy` workflow on `main` (Actions → Deploy → Run workflow) and check that it passes.
4. **Roll** or **delete** the old token in the Cloudflare dashboard.

If the token leaked, delete it first (step 4), then do steps 1–3. Check the account's Audit Log for actions you didn't make.

## 5. Read Workers logs

`wrangler.jsonc` sets `observability.enabled`, so logs are kept without extra setup.

- **Dashboard:** Workers & Pages → mengty-learns → **Observability** (logs, errors, request volume), or **Logs** → Live for a stream.
- **CLI (live tail):**
  ```bash
  pnpm exec wrangler tail mengty-learns --format pretty
  pnpm exec wrangler tail mengty-learns --status error
  ```

Requests for static assets (`/_next/static/*`, `public/`) do not run the Worker, so they don't show up in Worker logs.

## 6. Worker size

- Cloudflare's limit is **64 MiB uncompressed** on both Free and Paid. Its limits page says "There is no compressed size limit". The plan and the OpenNext docs still mention 3 MiB gzip on Free, but that figure is out of date (checked 2026-11-26).
- `scripts/check-worker-size.mjs` runs `wrangler deploy --dry-run` locally (no account needed), prints both sizes, adds them to the job summary, and fails above **48 MiB**. That gate leaves 16 MiB of headroom.
- First measurement (2026-11-26): **17.96 MiB uncompressed, 3.65 MiB gzip** (`Total Upload: 18394.49 KiB / gzip: 3742.55 KiB`).
- Content pages hardly change the size: their HTML/RSC are static assets, not Worker code. Code changes do: new dependencies, and especially server-side libraries.
- To check locally (WSL/Linux): `pnpm exec opennextjs-cloudflare build && node scripts/check-worker-size.mjs`.

## 7. Local preview

```bash
pnpm preview                                 # build + wrangler dev on http://localhost:8787
node scripts/qa-shots.mjs --widths 360,1280  # in another terminal
node scripts/qa-axe.mjs
pnpm qa:diagrams
```

On Windows, `opennextjs-cloudflare build` fails with `EPERM: operation not permitted, symlink`. Run it in WSL from a copy on the Linux filesystem (`~/…`, not `/mnt/c/…`), and use a Linux Node from WSL, not the Windows one. The preview on `localhost:8787` is reachable from Windows browsers and scripts.
