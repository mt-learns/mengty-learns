import type { Order } from '../../core/domain/order.js';
import type { OrderRepoPort } from '../../core/ports/order-repo-port.js';

/**
 * Driven Adapter (Production): simulates a Postgres repository implementing OrderRepoPort.
 */
export class PostgresOrderRepo implements OrderRepoPort {
  readonly executedStatements: string[] = [];

  async save(order: Order): Promise<Order> {
    this.executedStatements.push(
      `INSERT INTO orders (id, customer_id, total_cents) VALUES ('${order.id}', '${order.customerId}', ${order.totalCents})`,
    );
    return order;
  }
}
