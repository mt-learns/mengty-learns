import type { Order, OrderItem } from '../domain/order.js';

/**
 * Inbound Port: defines how driving adapters invoke the core use case.
 */
export interface PlaceOrderPort {
  execute(customerId: string, items: OrderItem[]): Promise<Order>;
}
