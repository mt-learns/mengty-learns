import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CsvDriver } from '../src/drivers/csv-driver.js';
import { PostgresDriver } from '../src/drivers/postgres-driver.js';
import type { StorageDriver } from '../src/drivers/storage-driver.js';
import { AsyncExporter } from '../src/exporters/async-exporter.js';
import { OrderExporter, type Order } from '../src/exporters/order-exporter.js';

describe('Bridge pattern: OrderExporter x StorageDriver', () => {
  it('exports a single order with OrderExporter + PostgresDriver', async () => {
    const exporter = new OrderExporter(new PostgresDriver());
    const receipt = await exporter.exportOrder({ id: 'ord_1', totalCents: 2500 });
    assert.equal(receipt, 'pg:orders:ord_1');
  });

  it('exports a batch with AsyncExporter + CsvDriver', async () => {
    const driver = new CsvDriver();
    const exporter = new AsyncExporter(driver);
    const receipts = await exporter.exportBatch([
      { id: 'ord_2', totalCents: 1200 },
      { id: 'ord_3', totalCents: 4900 },
    ]);

    assert.deepEqual(receipts, ['csv:row-1', 'csv:row-2']);
    assert.equal(driver.getRows().length, 2);
  });

  it('allows adding a new StorageDriver without modifying any Exporter', async () => {
    class S3Driver implements StorageDriver {
      readonly keys: string[] = [];
      async connect(): Promise<void> {}
      async writeRecord(collection: string, record: Record<string, unknown>): Promise<string> {
        const key = `s3://exports/${collection}/${String(record.id)}.json`;
        this.keys.push(key);
        return key;
      }
      async close(): Promise<void> {}
    }

    const s3 = new S3Driver();
    const singleReceipt = await new OrderExporter(s3).exportOrder({ id: 'ord_4', totalCents: 900 });
    const batchReceipts = await new AsyncExporter(s3).exportBatch([
      { id: 'ord_5', totalCents: 1500 },
    ]);

    assert.equal(singleReceipt, 's3://exports/orders/ord_4.json');
    assert.deepEqual(batchReceipts, ['s3://exports/orders/ord_5.json']);
  });

  it('allows adding a new Exporter without modifying any StorageDriver', async () => {
    class RetryingExporter extends OrderExporter {
      async exportWithRetry(order: Order, maxAttempts = 2): Promise<string> {
        let lastError: unknown;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            return await this.exportOrder(order);
          } catch (err) {
            lastError = err;
          }
        }
        throw lastError;
      }
    }

    const pgReceipt = await new RetryingExporter(new PostgresDriver()).exportWithRetry({
      id: 'ord_6',
      totalCents: 3100,
    });
    const csvReceipt = await new RetryingExporter(new CsvDriver()).exportWithRetry({
      id: 'ord_7',
      totalCents: 4200,
    });

    assert.equal(pgReceipt, 'pg:orders:ord_6');
    assert.equal(csvReceipt, 'csv:row-1');
  });
});
