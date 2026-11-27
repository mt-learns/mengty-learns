# PWA plan: installable, offline-first learning app (iOS + Android)

> Owner request (2026-11-27): make Mengty Learns a PWA, and plan for the real-device UI risks on iOS and Android.
> Current state: Next.js 16 on Cloudflare Workers (OpenNext). All routes are static (16 routes, ~500 prerendered paths). `viewport.themeColor` is set (light/dark), `apple-touch-icon.png` exists, and the CSP already allows `worker-src 'self' blob:` and `manifest-src 'self'`. Review progress lives in `localStorage` (`mt-review-v1`, `mt-completed-v1`). There's **no** web manifest and **no** service worker.

## 1. Goals and non-goals

**Goals**
1. **Installable** on Android (Chrome install prompt) and iOS (Safari → Share → Add to Home Screen), opening in standalone mode with the right icon, name, colours and safe areas.
2. **Offline reading:** any page you visited, plus the app shell, works with no network, with an honest offline page for pages you never opened.
3. **Offline review:** `/review` works fully offline (cards.json cached, progress local), which is the core daily habit.
4. **Safe updates:** a new release never strands users on stale HTML/JS. A clear "Update available" prompt appears, and no mixed versions.
5. **No regressions:** Lighthouse performance ≥ 0.9, CLS 0, axe 0 serious, all routes static, the CSP stays strict.

**Non-goals (this phase)**
- Push notifications or review reminders. They need a backend for web push, and on iOS they only work for installed PWAs (iOS 16.4+). Revisit later (§8).
- Background sync, periodic sync (not on iOS), payments, file handling.
- Precaching all ~500 pages (too much storage, and too risky on iOS quotas).

## 2. Design decisions

| # | Decision | Why |
|---|---|---|
| P1 | **A hand-written service worker** (`public/sw.js`), plus a small build script that writes the precache list (`scripts/build-sw.mjs` → `public/sw-manifest.json`) | Next 16 builds with Turbopack. Serwist/next-pwa depend on webpack plugins and add risk with OpenNext. A ~200-line SW is auditable and dependency-free. Use Workbox *only* if the hand-written approach proves fragile (record an ADR) |
| P2 | **Caching strategy:** app shell + `/_next/static/*` precached (immutable, hashed) · HTML pages **network-first** with a 3s timeout → cache → `/offline` · RSC payloads (`__next*`, `?_rsc=`) network-first → cache · images/SVG/fonts cache-first with a limit · `cards.json` stale-while-revalidate | Docs must be fresh when online and readable offline. Hashed assets never change. A network timeout stops bad mobile signal from hanging the app |
| P3 | **Versioned caches** `mt-<version>-<kind>`. The `activate` event deletes old caches. The SW checks for updates on every navigation, shows an **Update available → Reload** toast, and calls `skipWaiting` only after the user agrees | Avoids "half old, half new" pages, which is the classic PWA update bug |
| P4 | **`sw.js` served with `Cache-Control: no-cache`** and `Service-Worker-Allowed: /` (`public/_headers`). It's never caught by the immutable static rule | Otherwise browsers and the edge keep an old SW for up to 24h |
| P5 | **Manifest via `app/manifest.ts`**: `name` "Mengty Learns", `short_name` "Mengty", `id` "/", `start_url` "/?source=pwa", `scope` "/", `display` "standalone", `display_override` ["standalone"], `orientation` "any", `background_color`/`theme_color` from the Ink & Jade tokens (paper `#FAFAF8` / ink `#0E1013`), `icons` 192/512 **any + maskable** (separate files), `shortcuts` (Today's review, Docs, Radar), `screenshots` (narrow + wide, for Android's richer install UI) | Covers Chrome's install criteria and the richer install sheet |
| P6 | **Icons** from the `mt` logo (DESIGN.md logo rules): a maskable version with the mark inside the 80% safe zone on an ink or paper tile, `apple-touch-icon` 180×180 with **no transparency** (iOS fills transparency with black), and a monochrome icon for Android themed icons | Each platform crops icons differently |
| P7 | **iOS meta via the Next metadata API**: `appleWebApp: { capable: true, title: "Mengty", statusBarStyle: "default" }`, plus `viewport-fit=cover`. Splash images: start without them (iOS shows the background colour). Add generated `apple-touch-startup-image`s only if the blank flash looks bad on device | Startup images need one per screen size (~20 files), so only add them if needed |
| P8 | **Install UX:** Android/desktop: capture `beforeinstallprompt` and show a small, dismissible "Install app" item (nav menu + `/review` after 3 sessions). Never a pop-up on first visit. iOS: a one-time hint sheet "Share → Add to Home Screen", shown only in Safari (not in-app browsers) and not when already standalone | iOS has no install prompt API, and nagging hurts UX |
| P9 | **An "Offline ready" indicator** and a **"Save this section for offline"** action (precache one section's pages on demand, showing its size first) | Gives the user control over storage, which matters on iOS |

## 3. Real-device UI risks (iOS and Android) and mitigations

| # | Risk | Platform | Mitigation / acceptance |
|---|---|---|---|
| R1 | **Separate storage when installed.** On iOS, the home-screen app has its OWN storage, separate from Safari. Review progress made in Safari does **not** carry over after "Add to Home Screen" | iOS | Explain it in the install hint ("progress starts fresh in the app"). Add **Export/Import progress** (a JSON file or a copy-paste code) on `/review` settings. Never silently lose data |
| R2 | **Storage eviction.** Safari can evict script-writable storage (localStorage/Cache/IndexedDB) for sites not used for 7 days (ITP). Quotas are smaller | iOS | Call `navigator.storage.persist()` where supported. Keep the offline cache small (shell + visited pages, LRU limit about 50MB). Export/Import as the backup. Document it in the review FAQ |
| R3 | **Safe areas:** notch / Dynamic Island / home indicator overlap the nav, sticky headers, the TOC drawer, the search dialog and the flow controls in standalone mode | iOS (also Android with gesture nav) | `viewport-fit=cover` plus `env(safe-area-inset-*)` padding on the fixed/sticky nav, footer, bottom sheets and dialogs. Test in portrait and landscape (side insets) |
| R4 | **`100vh` jumps** with the dynamic toolbar, and the keyboard covering inputs (search) | iOS Safari, Android Chrome | Use `dvh`/`svh` for full-height UI. The search dialog is anchored to the top. Test with the on-screen keyboard open |
| R5 | **Status bar / theme colour** mismatch in dark mode or after a theme toggle. iOS reads `theme-color` only at launch in standalone | both | `themeColor` with media queries (light/dark), and also update `<meta name="theme-color">` when the in-app theme toggle changes. Use `statusBarStyle: "default"` (not black-translucent) unless the safe-area padding is verified |
| R6 | **No back button** in iOS standalone: users get stuck on deep pages | iOS | In standalone mode, show a visible back affordance in the docs header (and the breadcrumb), detected via `matchMedia('(display-mode: standalone)')` / `navigator.standalone`. External links open in Safari (`target="_blank"` with `rel`) |
| R7 | **Overscroll / pull-to-refresh** fighting React Flow pan/zoom gestures and the flashcard flip | both | `overscroll-behavior: contain` on the flow canvas and dialogs. `touch-action` set correctly on the canvas. Test pinch-zoom on flows on a real phone |
| R8 | **Tap targets and hover-only UI** (card lift/tilt, hover-to-replay demos) do nothing on touch | both | Every hover effect has a tap/focus equivalent (the demos already replay on tap; verify). Targets ≥ 44×44 (iOS HIG) / 48dp (Android) |
| R9 | **Stale SW serving an old app after deploy** (users stuck on an old version, broken chunk 404s) | both | P3 + P4. On a chunk-load error, reload once with a fresh SW. Test: deploy vN, open the app, deploy vN+1 → the update toast appears, the reload gets vN+1, and there are 0 console errors |
| R10 | **The OpenNext/Workers edge cache** serves an old `sw.js` or manifest | both | Use `no-cache` headers (P4). Verify with `curl -I` on production after deploy (RUNBOOK) |
| R11 | **Icon cropping:** maskable icons cut off the `mt` mark, iOS shows a black background behind a transparent icon | both | A maskable icon check (maskable.app-style safe zone) and a solid-background apple-touch-icon. Screenshot the home screen on both OSes |
| R12 | **Fonts and motion on low-end Android:** the font swap flash, jank from the motion and flow animations | Android | The fonts are self-hosted and cached by the SW. Respect `prefers-reduced-motion`. Test on a mid/low-end device or CPU-throttled Chrome (4× slowdown) |
| R13 | **In-app browsers** (Facebook/Telegram/LINE) don't support install or service workers properly | both | Detect them and hide the install UI there. The site must work as a normal website |
| R14 | **Offline page flows/search:** the Orama search index and React Flow chunks are missing offline | both | Precache the search index on first use. Show "Search needs a connection" offline. Flow chunks are cached once seen; show a static `<Diagram>` fallback offline |
| R15 | **CSP and the SW:** inline registration script or blob workers blocked | both | Register the SW from a bundled module (no inline). The CSP already allows `worker-src 'self' blob:`. 0 CSP violations is a gate |

## 4. Implementation steps (worker: agy, worktree `pwa`, one commit each)

1. `feat(pwa): web manifest and icons`: `app/manifest.ts`, icons 192/512 any + maskable + monochrome, solid `apple-touch-icon` 180, shortcuts, screenshots (narrow 1080×1920 + wide 1920×1080, from the real app), `appleWebApp` metadata, `viewport-fit=cover`. Extend `scripts/make-icons.mjs`; no hand-drawn new art.
2. `feat(pwa): service worker with versioned caches`: `public/sw.js`, `scripts/build-sw.mjs` (precache list + version from package.json, run after `next build`), registration in a client component (production only), and the `_headers` rules (P4).
3. `feat(pwa): offline page and offline review`: `/offline` (static, in the shell precache), offline handling for `/review` and cards.json, and the offline states for search and flows (R14).
4. `feat(pwa): update prompt`: an "Update available" toast plus a reload once on chunk-load errors (R9).
5. `feat(pwa): install UX`: the Android `beforeinstallprompt` menu item, a one-time iOS hint sheet, hidden in standalone and in-app browsers (P8, R13).
6. `fix(pwa): safe areas, dvh, standalone back button, overscroll`: R3–R8 across the nav, footer, dialogs, TOC drawer, flow canvas and flashcards.
7. `feat(review): export and import progress`: R1/R2, plus `navigator.storage.persist()`.
8. `docs(pwa): runbook and device test checklist`: `docs/pwa/DEVICE-TEST.md` (§5) and RUNBOOK additions (SW update/rollback: how to ship a kill-switch SW if needed).

## 5. Verification

**Automated (the worker must run these):**
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` green. Add unit tests for `build-sw.mjs` output and the cache-routing function (the SW strategy logic is a pure function tested in Vitest).
- Playwright (Chromium + **WebKit**) against `next start`:
  - the manifest is valid and linked, icons load (200, correct sizes);
  - the SW registers and controls the page;
  - **offline**: `context.setOffline(true)` → a visited docs page renders, an unvisited one shows `/offline`, `/review` works and grades a card;
  - **update**: serve build A, load, swap to build B → the update toast appears, the reload gets B;
  - device emulation `iPhone 15` and `Pixel 7` screenshots of `/`, a docs page, `/review`, the search dialog and the flow, light/dark, with the safe-area insets emulated by viewport-fit CSS.
- Lighthouse (lhci, the lead's method): performance ≥ 0.9 unchanged, CLS 0. Note: Lighthouse 12 removed the PWA category, so installability is checked with Chrome DevTools → Application → Manifest (no errors) and the Playwright checks.
- `node scripts/qa-axe.mjs`: 0 serious issues. 0 console errors, including CSP violations.

**Manual on real devices (the owner, using the `docs/pwa/DEVICE-TEST.md` checklist; the worker can't access real phones):**
- iPhone (iOS 18/19, Safari): Add to Home Screen → icon, name, splash colour, status bar, notch/home-indicator safe areas in portrait and landscape, back navigation, offline reading, `/review` offline, the update toast after a new release, the storage note.
- Android (Chrome, a recent Pixel/Samsung): the install prompt/menu, maskable icon shape, the themed icon, splash, the gesture-nav inset, offline, update, and a CPU-throttled smoothness check.
- Results go into DEVICE-TEST.md with screenshots. Any **P1 bug blocks the release**.

## 6. Release
- Ship as **v0.3.0** (MINOR: a new feature) per AGENTS.md §8, **only after** the owner's device checklist passes on at least one iPhone and one Android phone.
- Rollback: `wrangler rollback`, **plus** deploy a "kill-switch" `sw.js` (one that unregisters itself and clears caches) if the SW itself is broken. That procedure goes in the RUNBOOK, written in step 8.

## 7. Effort and owner
| Step | Effort | Owner |
|---|---|---|
| 1–2 | M | agy |
| 3–5 | M | agy |
| 6 | M (needs careful screenshots) | agy |
| 7 | S | agy |
| 8 | S | agy |
| Device test | S (30–45 min per device) | **Owner** |
| Review, merge, release | S | Lead |

## 8. Later (not in this plan)
- Review reminders: web push needs a push service plus VAPID keys and a tiny backend (a Worker + KV/D1). On iOS it only works for installed PWAs. Write an ADR first.
- Cloud sync of review progress across devices (needs auth plus storage, which changes the "static, no backend" decision, so it needs an ADR).
