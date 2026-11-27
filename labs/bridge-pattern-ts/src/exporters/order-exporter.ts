import type { StorageDriver } from '../drivers/storage-driver.js';

export interface Order {
  id: string;
  totalCents: number;
  [key: string]: unknown;
}

/**
 * Abstraction holding a bridge reference to a StorageDriver.
 */
export class OrderExporter {
  constructor(protected readonly driver: StorageDriver) {}

  async exportOrder(order: Order): Promise<string> {
    await this.driver.connect();
    try {
      return await this.driver.writeRecord('orders', order);
    } finally {
      await this.driver.close();
    }
  }
}
