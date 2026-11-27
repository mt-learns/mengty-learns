# Content Wave 0 — Notes & Out-of-Scope Items

1. **`lib/flows/k8s-request.ts` (`CNT-008`):** `lib/` is out of scope for Wave 0 ("Don't touch `components/`, `app/` or `lib/` code"). To satisfy `CNT-008` without modifying `lib/`, `content/docs/kubernetes/service-routing.mdx` inlines `<Flow id="k8s-request" ... />` with the updated kube-proxy DNAT/conntrack step text. The shared `K8S_REQUEST_FLOW` export in `lib/flows/k8s-request.ts` still has the older step text and can be synced by the lead if needed.
2. **Local CLI tools (`CNT-004`, `CNT-009`):** `hadolint` and `kubeconform` are not installed in this Windows environment (`docker build` ran and passed locally). Both `hadolint` and `kubeconform -strict` run in `.github/workflows/labs.yml`.

# Polish (branch `polish`)

1. **Docs to sync (outside this branch's files):**
   - `DESIGN.md` › Illustration Rules lists 9 section icons; there are now 10 (`process` added).
   - `DIAGRAM-RULES.md` §3.3(b) gives compact nodes 128–160px. Nodes now widen past 160px (up to 240px) when a label would otherwise need 3 lines, because §4.1 (full label visible) wins. The fit ladder re-checks the result.
   - `DIAGRAM-RULES.md` §6.3 places pills at the midpoint opposite the badge. The layout now places them clear of nodes, badges, other pills and the canvas edge. LR rank gaps widen to hold the widest pill. Compact flows show only the active edge's pill while stepping, and a pill with no free spot is dropped (0 of 275 flow labels and 4 of 185 diagram labels across 265–1024px).
2. **Group labels truncate (pre-existing, not in this brief):** `components/flow/v3/GroupNode.tsx` sets the group label with `truncate`, so long group names are cut with an ellipsis ("APPLICATION CORE (…" on `/docs/architecture/hexagonal/` at 360px and 1280px). DIAGRAM-RULES §4.1 forbids ellipses on node labels; group labels need the same treatment (wrap, or size the group to its label).
