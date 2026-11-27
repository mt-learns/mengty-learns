import type { StorageDriver } from './storage-driver.js';

/**
 * Concrete Implementation simulating a PostgreSQL storage driver.
 */
export class PostgresDriver implements StorageDriver {
  private connected = false;

  async connect(): Promise<void> {
    this.connected = true;
  }

  async writeRecord(collection: string, record: Record<string, unknown>): Promise<string> {
    if (!this.connected) {
      throw new Error('PostgresDriver is not connected');
    }
    return `pg:${collection}:${String(record.id ?? 'new')}`;
  }

  async close(): Promise<void> {
    this.connected = false;
  }
}
