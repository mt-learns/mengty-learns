import { OrderRepo, type OrderRow } from '../data/order-repo.js';

export interface OrderItemInput {
  priceCents: number;
  qty: number;
}

/**
 * Business Layer: directly imports OrderRepo (top-down dependency).
 */
export class OrderService {
  constructor(private readonly repo: OrderRepo) {}

  async placeOrder(customerId: string, items: OrderItemInput[]): Promise<OrderRow> {
    if (items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
    const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
    return this.repo.insert(customerId, totalCents);
  }
}
