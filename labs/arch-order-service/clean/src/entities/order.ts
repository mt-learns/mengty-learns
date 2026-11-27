import { randomUUID } from 'node:crypto';

export interface OrderItem {
  sku: string;
  priceCents: number;
  qty: number;
}

/**
 * Entity: enterprise business rules, zero dependencies on outer rings.
 */
export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly totalCents: number,
  ) {}

  static create(customerId: string, items: OrderItem[]): Order {
    if (items.length === 0) {
      throw new Error('Empty order');
    }
    const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.qty, 0);
    return new Order(randomUUID(), customerId, totalCents);
  }
}
