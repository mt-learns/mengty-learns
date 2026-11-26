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
