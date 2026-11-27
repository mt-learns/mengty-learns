export interface ReviewBackup {
  version?: number;
  exportedAt?: string;
  state?: Record<string, unknown>;
  streak?: number;
  completed?: string[];
}

export function serializeReviewBackup(
  state: Record<string, unknown>,
  streak: number,
  completed: string[],
): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      state,
      streak,
      completed,
    },
    null,
    2,
  );
}

export function parseReviewBackup(raw: string): ReviewBackup {
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid backup object');
  }
  const obj = parsed as Record<string, unknown>;
  if (
    obj.state !== undefined &&
    (typeof obj.state !== 'object' || obj.state === null || Array.isArray(obj.state))
  ) {
    throw new Error('Invalid state');
  }
  if (obj.streak !== undefined && (typeof obj.streak !== 'number' || !Number.isFinite(obj.streak))) {
    throw new Error('Invalid streak');
  }
  if (
    obj.completed !== undefined &&
    (!Array.isArray(obj.completed) || !obj.completed.every((x) => typeof x === 'string'))
  ) {
    throw new Error('Invalid completed list');
  }
  if (obj.state === undefined && obj.streak === undefined && obj.completed === undefined) {
    throw new Error('Empty backup');
  }
  return obj as ReviewBackup;
}
