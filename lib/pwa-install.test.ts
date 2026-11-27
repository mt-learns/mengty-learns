import { describe, expect, it } from 'vitest';
import { isInAppBrowser, isIosSafari } from './pwa-install';

describe('pwa-install helpers', () => {
  it('detects common in-app browsers', () => {
    expect(isInAppBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) FBAN/FBIOS')).toBe(
      true,
    );
    expect(isInAppBrowser('Mozilla/5.0 (Linux; Android 14) Line/14.0.0')).toBe(true);
    expect(isInAppBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Instagram')).toBe(
      true,
    );
    expect(
      isInAppBrowser(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      ),
    ).toBe(false);
  });

  it('detects iOS Safari and excludes Chrome/Firefox/in-app on iOS', () => {
    const iosSafari =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
    const iosChrome =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.0.0 Mobile/15E148 Safari/604.1';
    const androidChrome =
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';

    expect(isIosSafari(iosSafari)).toBe(true);
    expect(isIosSafari(iosChrome)).toBe(false);
    expect(isIosSafari(androidChrome)).toBe(false);
    expect(isIosSafari('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', 5)).toBe(
      true,
    );
  });
});
