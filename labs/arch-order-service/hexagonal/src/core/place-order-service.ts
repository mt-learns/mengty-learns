import { randomUUID } from 'node:crypto';
import type { Order, OrderItem } from './domain/order.js';
import type { OrderRepoPort } from './ports/order-repo-port.js';
import type { PlaceOrderPort } from './ports/place-order-port.js';

/**
 * Application Core: zero imports from adapters, HTTP, or SQL drivers.
 */
export class PlaceOrderService implements PlaceOrderPort {
  constructor(private readonly repo: OrderRepoPort) {}

  async execute(customerId: string, items: OrderItem[]): Promise<Order> {
    if (items.length === 0) {
      throw new Error('Empty order');
    }
    const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.qty, 0);
    return this.repo.save({ id: randomUUID(), customerId, totalCents });
  }
}
