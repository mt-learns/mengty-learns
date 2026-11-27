import { describe, expect, it } from 'vitest';
import { parseReviewBackup, serializeReviewBackup } from './review-backup';

describe('review-backup', () => {
  it('round-trips state, streak, and completed pages', () => {
    const json = serializeReviewBackup({ c1: { due: '2026-12-01' } }, 4, ['/docs/design/bridge/']);
    const parsed = parseReviewBackup(json);
    expect(parsed.version).toBe(1);
    expect(parsed.state).toEqual({ c1: { due: '2026-12-01' } });
    expect(parsed.streak).toBe(4);
    expect(parsed.completed).toEqual(['/docs/design/bridge/']);
  });

  it('rejects malformed or empty JSON', () => {
    expect(() => parseReviewBackup('not json')).toThrow();
    expect(() => parseReviewBackup('{}')).toThrow();
    expect(() => parseReviewBackup('{"streak":"bad"}')).toThrow();
  });
});
