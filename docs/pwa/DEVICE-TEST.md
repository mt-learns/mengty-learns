# Real-Device PWA Test Checklist

Run this checklist on a real **iPhone** (iOS 18+, Safari → Add to Home Screen) and a real **Android phone** (Chrome → Install app) before tagging `v0.3.0`.

**Any P1 failure blocks the release.**

## Device Info

| Device | OS & Version | Browser | Tester | Date |
|---|---|---|---|---|
| iPhone | | Safari (iOS) | | |
| Android | | Chrome | | |

---

## 1. Install, Icons, and Manifest (P5, P6, P8, R11, R13)

| # | Risk | Platform | Steps to verify | Expected result | Pass / Fail | Screenshot / Notes |
|---|---|---|---|---|---|---|
| 1 | R11 | iOS | Open `https://learn.limmengty.com/` in Safari → Share → **Add to Home Screen**. Check icon on Home Screen. | `mt` monogram on solid `#FAFAF8` paper tile, no black background, crisp edges, label `Mengty`. | | |
| 2 | R11 | Android | Open `https://learn.limmengty.com/` in Chrome → menu → **Install app** (or footer **Install app**). Check launcher icon + themed icon (if enabled). | `mt` monogram centered inside adaptive mask (circle/squircle) with no clipped stroke/dot; themed icon tints cleanly. | | |
| 3 | P8 | Both | Visit `/` for the first time. | No nagging install pop-up on first visit. | | |
| 4 | P8 | Both | Visit `/review/` 3+ times (or 3 sessions) in mobile browser. | Dismissible install banner/hint appears on `/review/`; dismissing hides it permanently. | | |
| 5 | R13 | Both | Open `https://learn.limmengty.com/` inside an in-app browser (Telegram, Facebook, LINE, or Instagram). | Site works normally as a web page; install UI is hidden. | | |

---

## 2. Standalone Mode, Safe Areas, and Viewport (R3, R4, R5, R6, R7, R8)

| # | Risk | Platform | Steps to verify | Expected result | Pass / Fail | Screenshot / Notes |
|---|---|---|---|---|---|---|
| 6 | R3 | iOS | Launch installed app in **portrait** and **landscape**. Inspect top nav, footer, TOC drawer, and search dialog. | No overlap with Dynamic Island / notch, status bar, or home indicator; side insets respected in landscape. | | |
| 7 | R3 | Android | Launch installed app with gesture navigation enabled. Check bottom toast/footer/dialogs. | Gesture nav bar does not cover buttons or bottom toasts. | | |
| 8 | R4 | Both | Open search (`Search` button) on mobile; tap input so on-screen keyboard opens. | Input and results stay visible above keyboard; no `100vh` jump when scrolling. | | |
| 9 | R5 | Both | Toggle Light ↔ Dark theme in standalone mode. | Status bar / `<meta name="theme-color">` updates to `#FAFAF8` (light) or `#0E1013` (dark) with readable status icons. | | |
| 10 | R6 | iOS | Open a deep docs page (e.g. `/docs/design/bridge/`) in iOS standalone mode. | Visible **Back** and **All docs** bar appears at top of docs page; tapping Back returns cleanly; external links open in Safari. | | |
| 11 | R7 | Both | On `/docs/design/bridge/`, pan and pinch-zoom the `<Flow>` canvas; also drag down inside TOC/search dialogs. | Pull-to-refresh does not hijack `<Flow>` pan/zoom or dialog scrolling. | | |
| 12 | R8 | Both | Tap cards, `<Flow>` step dots/Play, and review rating buttons on touch screen. | All tap targets ≥ 44×44px, responsive on tap with no hover-only dead controls. | | |

---

## 3. Offline, Storage, and Updates (R1, R2, R9, R10, R12, R14, R15)

| # | Risk | Platform | Steps to verify | Expected result | Pass / Fail | Screenshot / Notes |
|---|---|---|---|---|---|---|
| 13 | R1 | iOS | Grade a card in Safari on `/review/`, export backup JSON (or Copy backup), install to Home Screen, open installed app `/review/`, import backup. | Safari and standalone app have separate storage (expected); Import restores schedule, streak, and completed pages cleanly. | | |
| 14 | R2 | iOS | Check `/review/` Backup & Restore section. | Storage status note and 7-day ITP/backup guidance are visible. | | |
| 15 | R14 | Both | Visit `/docs/design/bridge/` online, then enable **Airplane Mode**. Reload `/docs/design/bridge/`, navigate to an **unvisited** docs page, open `/review/` and grade a card, open Search. | Visited page renders; unvisited page shows `/offline/` with list of cached docs; `/review/` grades cards offline; Search shows offline message (or cached results if opened online first). | | |
| 16 | R14 | Both | Visit an **unvisited** `<Flow>` page while offline (if cached HTML) or block flow chunk. | Static `<Diagram>` fallback renders with offline note instead of crashing. | | |
| 17 | R9/R10 | Both | With app open, deploy a new build, then return to app / navigate. | **"Update available"** toast appears; tapping **Reload** activates new SW and loads new version with 0 errors. | | |
| 18 | R12 | Android | Scroll `/` and `/docs/design/bridge/` on a mid/low-end Android (or with Reduced Motion enabled). | Self-hosted fonts load without flash; `prefers-reduced-motion` disables animations. | | |
| 19 | R15 | Both | Inspect browser console / remote DevTools on `/`, `/docs/design/bridge/`, `/review/`. | 0 console errors, 0 CSP violations, SW registered and controlling page. | | |
