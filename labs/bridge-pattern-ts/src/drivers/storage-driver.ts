/**
 * Implementation interface (Implementor) for low-level storage backends.
 */
export interface StorageDriver {
  connect(): Promise<void>;
  writeRecord(collection: string, record: Record<string, unknown>): Promise<string>;
  close(): Promise<void>;
}
