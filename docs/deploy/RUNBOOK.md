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

1. Push `main`, then push the release tag (section 9). On a `vX.Y.Z` tag, `deploy.yml` runs lint, typecheck, tests, `opennextjs-cloudflare build`, the static-route gate and the size gate, then `opennextjs-cloudflare deploy`.
2. The first deploy creates the Worker, enables `mengty-learns.<account-subdomain>.workers.dev`, and attaches the custom domain. Cloudflare creates the DNS record and the certificate. The certificate can take a few minutes.
3. Open the run's job summary: it lists the deployed URLs and the version ID.

## 2. Check the custom domain and headers

```bash
curl -sI https://learn.limmengty.com/ | grep -iE "^HTTP|content-security-policy|strict-transport|x-content-type|referrer-policy|permissions-policy|x-frame-options|x-opennext-cache"
curl -sI https://learn.limmengty.com/_next/static/  # any hashed file from the page: Cache-Control public, max-age=31536000, immutable
curl -sI https://learn.limmengty.com/sw.js | grep -iE "^HTTP|^cache-control|^service-worker-allowed"  # Cache-Control: no-cache, Service-Worker-Allowed: /
curl -sI https://learn.limmengty.com/manifest.webmanifest | grep -iE "^HTTP|^content-type"             # 200, application/manifest+json
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

### 3a. Service Worker emergency kill-switch

If a broken `public/sw.js` is caching bad responses or stranding clients, `wrangler rollback` alone may not immediately clear clients that already installed the bad SW if they are offline or waiting. Ship a kill-switch `public/sw.js` as a PATCH release:

```js
// Emergency kill-switch sw.js: unregisters itself and clears all mt-* caches.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('mt-')).map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) client.navigate(client.url);
    })(),
  );
});
```

Verify `curl -sI https://learn.limmengty.com/sw.js` returns `Cache-Control: no-cache` so browsers fetch the kill-switch within one navigation.

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
- Go-live measurement (2026-11-27, 92 docs pages): **31.68 MiB uncompressed, 5.66 MiB gzip** (`Total Upload: 32443.47 KiB / gzip: 5793.89 KiB`).
- Content pages **do** grow the Worker. Their HTML/RSC are static assets, but the compiled MDX of every page (about 3.8 MB in total) is also bundled into about six server chunks (docs page, digest, home, radar, review, `llms.mdx`). The content waves added roughly 14 MiB. At this rate the 48 MiB gate is a few content waves away. When it gets close, look at lazy-loading the docs collection (Fumadocs `async` mode) so that page bodies leave the Worker bundle. New dependencies, especially server-side libraries, grow it too.
- To check locally (WSL/Linux): `pnpm exec opennextjs-cloudflare build && node scripts/check-worker-size.mjs`.

## 7. Local preview

```bash
pnpm preview                                 # build + wrangler dev on http://localhost:8787
node scripts/qa-shots.mjs --widths 360,1280  # in another terminal
node scripts/qa-axe.mjs
pnpm qa:diagrams
```

On Windows, `opennextjs-cloudflare build` fails with `EPERM: operation not permitted, symlink`. Run it in WSL from a copy on the Linux filesystem (`~/…`, not `/mnt/c/…`), and use a Linux Node from WSL, not the Windows one. The preview on `localhost:8787` is reachable from Windows browsers and scripts.

### 7a. WSL check (worked 2026-11-27: WSL2 Ubuntu, Node 22.23.5, pnpm 11.6.0)

One-time setup in WSL: a Linux Node 22 from nodejs.org, checksum-verified, and pnpm through corepack. No sudo is needed.

```bash
wsl -d Ubuntu            # starts the distro if it is stopped
cd ~
curl -fsSL https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt -o node-sums.txt
V=$(grep -o "node-v22[0-9.]*-linux-x64.tar.xz" node-sums.txt | sort -u)
curl -fsSLO "https://nodejs.org/dist/latest-v22.x/$V"
grep " $V\$" node-sums.txt | sha256sum -c -
mkdir -p ~/.local/node22 && tar -xJf "$V" -C ~/.local/node22 --strip-components=1 && rm "$V" node-sums.txt
export PATH="$HOME/.local/node22/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
corepack enable --install-directory ~/.local/node22/bin
corepack prepare pnpm@11.6.0 --activate
```

Each session: put the Linux Node first, and keep Windows' `/mnt/c/...` Node off `PATH`. WSL appends the Windows `PATH`, and its `node`/`corepack` either can't run or pick the wrong platform binaries.

```bash
export PATH="$HOME/.local/node22/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0 NEXT_TELEMETRY_DISABLED=1 WRANGLER_SEND_METRICS=false
```

Clone from the **main repo**, not from an Orca/git worktree. A worktree's `.git` file holds a Windows path (`D:/me/mt/.git/worktrees/...`) that Linux git can't resolve (`fatal: not a git repository`). Branches are shared, so clone the branch by name:

```bash
rm -rf ~/mengty-learns-check
git clone --branch <branch> /mnt/d/me/mt ~/mengty-learns-check
cd ~/mengty-learns-check
pnpm install --frozen-lockfile
pnpm lint && pnpm typecheck && pnpm test && pnpm build   # build ends with check-static-routes
pnpm exec opennextjs-cloudflare build
node scripts/check-worker-size.mjs                        # local dry run, no account
pnpm exec opennextjs-cloudflare preview --port 8787 --ip 0.0.0.0
```

To pick up new commits: `git fetch origin <branch> && git reset --hard origin/<branch>`, then rebuild.

Run the QA scripts **from Windows** against `http://localhost:8787`. Playwright's Chromium in WSL needs `libnss3`, `libnspr4` and `libasound2` (`sudo pnpm exec playwright install-deps chromium`). If you have no sudo there, use Windows Node with Playwright 1.65.1 and `@axe-core/playwright` 4.14.1:

```bash
node scripts/qa-axe.mjs --url http://localhost:8787
node scripts/qa-shots.mjs --url http://localhost:8787 --widths 360,1280
```

In Git Bash, set `MSYS_NO_PATHCONV=1` before passing `--routes /digest/`. Otherwise Git Bash turns `/digest/` into `C:/Program Files/Git/digest/`.

Stop the preview: `pkill -f "opennextjs-cloudflare preview"; pkill -f workerd` (in WSL).

## 8. Go-live checklist (lead)

Do the owner prerequisites in §1 first (zone active, no DNS record on `learn.limmengty.com`, token and account-ID secrets in GitHub).

1. **Release.** Follow section 9: bump the version, push `main`, then push the tag `vX.Y.Z`. Pushing `main` alone never deploys.
2. **Watch the Actions run.** `gh run watch $(gh run list --workflow deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')`, or Actions → Deploy. Every step must be green: lint, typecheck, test, OpenNext build, static-route gate, size gate (about 31.7 MiB), deploy. The job summary lists the `workers.dev` URL and the version ID. Write the version ID down: it is your rollback target next time.
3. **workers.dev URL.** Open `https://mengty-learns.<account-subdomain>.workers.dev/`. Home, `/docs/`, `/docs/design/bridge/` (the flow plays), `/review/`, `/radar/`, `/digest/` all load. Ctrl+K returns results, and DevTools shows 0 console errors and no CSP reports.
4. **Custom domain.** Dashboard → Workers & Pages → mengty-learns → Settings → Domains & Routes shows `learn.limmengty.com` as an active Custom domain. Then `https://learn.limmengty.com/` loads with a valid certificate (the certificate can take a few minutes on the first deploy).
5. **Headers on production** (expected values in §2):
   ```bash
   B=https://learn.limmengty.com
   for p in / /docs/ /docs/design/bridge/ /digest/rss.xml /sitemap.xml /robots.txt /llms.txt; do
     echo "== $p"; curl -sI "$B$p" | grep -iE "^HTTP|^cache-control|content-security-policy|strict-transport|x-content-type|referrer-policy|permissions-policy|x-frame-options|x-opennext-cache"
   done
   curl -sI "$B$(curl -s $B/ | grep -o '/_next/static/[^"]*\.js' | head -1)" | grep -iE "^HTTP|^cache-control"   # public, max-age=31536000, immutable
   curl -s -o /dev/null -w "%{http_code}\n" "$B/this-page-does-not-exist/"                                     # 404
   curl -s "$B/sitemap.xml" | grep -c "https://learn.limmengty.com"                                             # > 0, no other origin
   ```
6. **Lighthouse on production.** `lighthouserc.json` points at `localhost:8787`, so skip its collect URLs and keep its thresholds:
   ```bash
   rm -rf .lighthouseci
   pnpm exec lhci collect --no-lighthouserc -n 3 \
     --url https://learn.limmengty.com/ --url https://learn.limmengty.com/docs/ \
     --url https://learn.limmengty.com/docs/design/bridge/ --url https://learn.limmengty.com/review/
   pnpm exec lhci assert        # thresholds from lighthouserc.json: perf ≥ 0.90, a11y/best-practices/SEO ≥ 0.95
   ```
   Alternatively, use Chrome DevTools → Lighthouse (mobile, clean profile). Record the four scores in the release note.
7. **If anything is wrong: roll back first, then fix forward** (§3): `pnpm exec wrangler deployments list`, then `pnpm exec wrangler rollback <last-good-version-id>`. On the very first deploy there is no older version: remove the custom domain in the dashboard (or leave it) and push a fix. After a rollback, revert the bad commit on `main`, then ship the fix as the next PATCH release (section 9). Only a new tag deploys.

## 9. Releases (every deploy is a release)

Rule: AGENTS.md section 8. Production changes only when a `vX.Y.Z` tag is pushed. The Deploy workflow then:
1. Checks that the tag equals `package.json` `version` and that the tagged commit is on `main`.
2. Runs lint, typecheck, test, the OpenNext build, the static-route gate and the size gate.
3. Deploys with `--tag vX.Y.Z`, so the Worker version is labelled with the release.
4. **Only if the deploy succeeded**, creates the GitHub Release `vX.Y.Z` with generated notes.

```bash
# on main, after CI and Quality Gates are green
npm pkg set version=0.2.0                       # MAJOR.MINOR.PATCH, see AGENTS.md section 8
git commit -am "chore(release): v0.2.0"
git push origin main
git tag -a v0.2.0 -m "v0.2.0"
git push origin v0.2.0
gh run watch $(gh run list --workflow deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
gh release view v0.2.0                           # exists once the deploy is green
```

If the deploy fails, no release is created. Fix it on `main`. A tag that has **no** GitHub Release (the deploy never finished) may be deleted and re-created on the fix (`git push --delete origin vX.Y.Z`, then tag again). Once a release exists, its tag is permanent: ship the next PATCH instead.

Note: `opennextjs-cloudflare deploy` passes extra flags to Wrangler through a shell without quoting, so never pass values with spaces or parentheses (for example `--message`).
If a released version is bad: `wrangler rollback` (section 3), then ship the fix as the next PATCH release.
