import { OrderExporter, type Order } from './order-exporter.js';

/**
 * Refined Abstraction adding batch export without coupling to any specific driver.
 */
export class AsyncExporter extends OrderExporter {
  async exportBatch(orders: Order[]): Promise<string[]> {
    await this.driver.connect();
    try {
      return await Promise.all(
        orders.map((order) => this.driver.writeRecord('orders', order)),
      );
    } finally {
      await this.driver.close();
    }
  }
}
