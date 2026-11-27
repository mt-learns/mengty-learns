# Content Wave 0 — Notes & Out-of-Scope Items

1. **`lib/flows/k8s-request.ts` (`CNT-008`):** `lib/` is out of scope for Wave 0 ("Don't touch `components/`, `app/` or `lib/` code"). To satisfy `CNT-008` without modifying `lib/`, `content/docs/kubernetes/service-routing.mdx` inlines `<Flow id="k8s-request" ... />` with the updated kube-proxy DNAT/conntrack step text. The shared `K8S_REQUEST_FLOW` export in `lib/flows/k8s-request.ts` still has the older step text and can be synced by the lead if needed.
2. **Local CLI tools (`CNT-004`, `CNT-009`):** `hadolint` and `kubeconform` are not installed in this Windows environment (`docker build` ran and passed locally). Both `hadolint` and `kubeconform -strict` run in `.github/workflows/labs.yml`.
# Content Wave 9 (Leadership) — Notes & Out-of-Scope Code Changes

6. **Leadership section icon (`components/illustrations/`), landing-page grid (`lib/home-data.ts`), and `index.mdx` icon prop:**
   - `lib/home-data.ts` and `components/illustrations/` are code outside Wave 9's allowed scope.
   - **Needed in `components/illustrations/types.ts` & `SectionIcon.tsx`:** Add `'leadership'` to `SECTION_ICON_NAMES`, `DEFAULT_TITLES` (`'Leadership section icon'`), `SECTION_TINTS`, and render an original soft 3D clay icon.
   - **Needed in `lib/home-data.ts`:** Add `leadership` to `SECTION_COPY` (`Title: 'Leadership'`, `Blurb: 'Transitioning to team lead, clarity, delegation, feedback, and engineering health.'`) and rebalance the home section grid (13 cards total with `leadership`, `frontend`, and `platform`).
   - **Needed in `content/docs/index.mdx` and `content/docs/leadership/meta.json`:** Once `<SectionIcon name="leadership" />` exists, add `icon={<SectionIcon name="leadership" size={24} decorative />}` to the Leadership `<Card>` in `content/docs/index.mdx` and `"icon": "leadership"` to `content/docs/leadership/meta.json`.
