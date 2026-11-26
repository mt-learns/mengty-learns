/**
 * Parses ?flow=<id>&step=<n> (1-based) from a query string.
 * Returns a 0-based step index if valid for this flow, or null otherwise.
 */
export function parseFlowDeepLink(
  search: string,
  flowId: string,
  stepCount: number,
): number | null {
  if (stepCount <= 0) return null;
  const params = new URLSearchParams(search);
  if (params.get('flow') !== flowId) return null;

  const rawStep = params.get('step');
  if (!rawStep || !/^\d+$/.test(rawStep)) return null;

  const oneBased = Number(rawStep);
  if (!Number.isInteger(oneBased) || oneBased < 1 || oneBased > stepCount) {
    return null;
  }

  return oneBased - 1;
}

/**
 * Builds a relative URL preserving existing query params and hash, updating ?flow and ?step (1-based).
 */
export function buildFlowDeepLinkRelative(
  pathname: string,
  search: string,
  hash: string,
  flowId: string,
  stepIndex: number,
): string {
  const params = new URLSearchParams(search);
  params.set('flow', flowId);
  params.set('step', String(stepIndex + 1));
  const qs = params.toString();
  return `${pathname}${qs ? `?${qs}` : ''}${hash}`;
}

/**
 * Builds a full shareable URL with ?flow=<id>&step=<n> (1-based).
 */
export function buildFlowDeepLinkUrl(
  href: string,
  flowId: string,
  stepIndex: number,
): string {
  const url = new URL(href);
  url.searchParams.set('flow', flowId);
  url.searchParams.set('step', String(stepIndex + 1));
  return url.toString();
}
