export interface OrderRow {
  id: string;
  customerId: string;
  totalCents: number;
}

/**
 * Data Layer: owns persistence details (in-memory store simulating Postgres).
 */
export class OrderRepo {
  private readonly rows = new Map<string, OrderRow>();
  private nextId = 101;

  async insert(customerId: string, totalCents: number): Promise<OrderRow> {
    const row: OrderRow = {
      id: `ord_${this.nextId++}`,
      customerId,
      totalCents,
    };
    this.rows.set(row.id, row);
    return row;
  }

  async findById(id: string): Promise<OrderRow | undefined> {
    return this.rows.get(id);
  }
}
