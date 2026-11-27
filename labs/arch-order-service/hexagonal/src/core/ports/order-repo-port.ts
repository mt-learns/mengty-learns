import type { Order } from '../domain/order.js';

/**
 * Outbound Port: owned by the core; implemented by driven adapters.
 */
export interface OrderRepoPort {
  save(order: Order): Promise<Order>;
}
