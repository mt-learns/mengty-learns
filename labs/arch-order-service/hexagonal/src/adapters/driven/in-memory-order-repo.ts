import type { Order } from '../../core/domain/order.js';
import type { OrderRepoPort } from '../../core/ports/order-repo-port.js';

/**
 * Driven Adapter (Tests): fast in-memory Map implementing OrderRepoPort.
 */
export class InMemoryOrderRepo implements OrderRepoPort {
  public readonly store = new Map<string, Order>();

  async save(order: Order): Promise<Order> {
    this.store.set(order.id, order);
    return order;
  }
}
