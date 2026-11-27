import type { Order } from '../entities/order.js';
import type { OrderGateway } from '../use-cases/place-order.js';

/**
 * Interface Adapter (Gateway): implements OrderGateway for in-memory storage.
 */
export class InMemoryOrderGateway implements OrderGateway {
  readonly saved = new Map<string, Order>();

  async save(order: Order): Promise<Order> {
    this.saved.set(order.id, order);
    return order;
  }
}
