import type { StorageDriver } from './storage-driver.js';

/**
 * Concrete Implementation that buffers serialized records as CSV/JSON rows.
 */
export class CsvDriver implements StorageDriver {
  private rows: string[] = [];
  private connected = false;

  async connect(): Promise<void> {
    this.rows = [];
    this.connected = true;
  }

  async writeRecord(_collection: string, record: Record<string, unknown>): Promise<string> {
    if (!this.connected) {
      throw new Error('CsvDriver is not connected');
    }
    this.rows.push(JSON.stringify(record));
    return `csv:row-${this.rows.length}`;
  }

  async close(): Promise<void> {
    this.connected = false;
  }

  getRows(): readonly string[] {
    return this.rows;
  }
}
