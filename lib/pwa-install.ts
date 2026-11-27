const IN_APP_RE =
  /FBAN|FBAV|Instagram|Telegram|Line\/|MicroMessenger|BytedanceWebview|musical_ly|LinkedInApp|Snapchat/i;

export function isInAppBrowser(userAgent: string): boolean {
  return IN_APP_RE.test(userAgent);
}

export function isIosSafari(userAgent: string, maxTouchPoints = 0): boolean {
  if (isInAppBrowser(userAgent)) return false;
  const isIosDevice =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);
  if (!isIosDevice) return false;
  const isOtherIosBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent);
  return isSafari && !isOtherIosBrowser;
}

export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  const matchStandalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone =
    'standalone' in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return matchStandalone || iosStandalone;
}
