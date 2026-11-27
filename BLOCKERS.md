# Content Wave 0 — Notes & Out-of-Scope Items

1. **`lib/flows/k8s-request.ts` (`CNT-008`):** `lib/` is out of scope for Wave 0 ("Don't touch `components/`, `app/` or `lib/` code"). To satisfy `CNT-008` without modifying `lib/`, `content/docs/kubernetes/service-routing.mdx` inlines `<Flow id="k8s-request" ... />` with the updated kube-proxy DNAT/conntrack step text. The shared `K8S_REQUEST_FLOW` export in `lib/flows/k8s-request.ts` still has the older step text and can be synced by the lead if needed.
2. **Local CLI tools (`CNT-004`, `CNT-009`):** `hadolint` and `kubeconform` are not installed in this Windows environment (`docker build` ran and passed locally). Both `hadolint` and `kubeconform -strict` run in `.github/workflows/labs.yml`.

# Content Wave 5 — Notes & Out-of-Scope Code Changes

3. **Landing-page section grid (`lib/home-data.ts`) and section icon (`components/illustrations/`):**
   - `lib/home-data.ts` and `components/illustrations/` are code outside Wave 5's allowed scope.
   - **Needed in `components/illustrations/types.ts` & `SectionIcon.tsx`:** Add `'process'` to `SECTION_ICON_NAMES`, `DEFAULT_TITLES` (`'Process section icon'`), `SECTION_TINTS`, and render a soft 3D clay icon (e.g., a checklist clipboard or workflow nodes in a squircle).
   - **Needed in `lib/home-data.ts`:** Add `process` to `SECTION_COPY`:
     - **Key:** `process`
     - **Title:** `Process`
     - **Blurb:** `Idea to production, ADRs, quality gates, and retros for small teams.`
   - **Needed in `content/docs/index.mdx`:** Once `<SectionIcon name="process" />` exists, add `icon={<SectionIcon name="process" size={24} decorative />}` to the Process `<Card>`.

# Typography (branch `typography`)

4. **Flow node labels now render in Inter, and two more clamp at 360px.** Before this branch Inter never applied: `app/global.css` had `:root { --font-inter: var(--font-inter); }`, a self-referencing custom property that invalidated the variable, so every page used the system font (Segoe UI on Windows). With Inter actually rendering, labels are wider. A scan of all 29 pages with flows at 360px (68 node labels) finds 4 labels hitting `line-clamp-2` against 2 before: `PlaceOrderPort` (already clamped) and `OrderRepoPort` on `/docs/architecture/hexagonal/`, `Push / PR Trigger` (already clamped) on `/docs/ci-cd/pipeline-anatomy/`, and `API Server + etcd` on `/docs/kubernetes/kubectl-apply/`. Node boxes, zoom and the fit ladder are unchanged, and `pnpm test` passes. Label tracking doesn't fix it (−0.01em: 4 clamped, −0.02em: 3), so the fix is in `components/flow` (node width at the narrow rung, or a 13px compact label), which is out of scope for the typography worker.

# Landing Motion (branch `landing-motion`)

5. **Desktop `LR` direction on `<Flow>` (`components/flow/` & `components/diagram/`):** `FlowPropsSchema` (`components/diagram/types.ts`) only accepts `layout: 'flow' | 'tree'` and has no `direction` prop (`'LR' | 'TB'`). Additionally, `FlowServer` (`components/flow/FlowServer.tsx`) only precomputes layouts up to `720px` (`PRECOMPUTE_WIDTHS`), and `computeDiagramLayout` (`components/diagram/layout.ts`) selects `TB` for `K8S_REQUEST_FLOW` at `720px`, leaving empty horizontal space on the `1200px` desktop landing container. **Needed in `components/flow/` + `components/diagram/` (polish worker):** expose an optional `direction?: 'LR' | 'TB'` (or `desktopDirection`) prop on `FlowProps` / `FlowServer`, or include wider breakpoints (e.g. `960`, `1136`) in `PRECOMPUTE_WIDTHS` so 4-rank flows lay out left-to-right on desktop. Also consider an explicit `autoPlay?: boolean` prop on `Player` so `K8sFlowObserver` does not have to trigger `Start`/`Pause` via button clicks.

# Content Wave 9 (Leadership) — Notes & Out-of-Scope Code Changes

6. **Leadership section icon (`components/illustrations/`), landing-page grid (`lib/home-data.ts`), and `index.mdx` icon prop:**
   - `lib/home-data.ts` and `components/illustrations/` are code outside Wave 9's allowed scope.
   - **Needed in `components/illustrations/types.ts` & `SectionIcon.tsx`:** Add `'leadership'` to `SECTION_ICON_NAMES`, `DEFAULT_TITLES` (`'Leadership section icon'`), `SECTION_TINTS`, and render an original soft 3D clay icon.
   - **Needed in `lib/home-data.ts`:** Add `leadership` to `SECTION_COPY` (`Title: 'Leadership'`, `Blurb: 'Transitioning to team lead, clarity, delegation, feedback, and engineering health.'`) and rebalance the home section grid (13 cards total with `leadership`, `frontend`, and `platform`).
   - **Needed in `content/docs/index.mdx` and `content/docs/leadership/meta.json`:** Once `<SectionIcon name="leadership" />` exists, add `icon={<SectionIcon name="leadership" size={24} decorative />}` to the Leadership `<Card>` in `content/docs/index.mdx` and `"icon": "leadership"` to `content/docs/leadership/meta.json`.
