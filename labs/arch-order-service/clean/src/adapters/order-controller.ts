import type { OrderItem } from '../entities/order.js';
import type { PlaceOrderInteractor } from '../use-cases/place-order.js';

/**
 * Interface Adapter (Controller): maps raw input into PlaceOrderRequest.
 */
export class OrderController {
  constructor(private readonly interactor: PlaceOrderInteractor) {}

  async handlePost(body: { customerId: string; items: OrderItem[] }): Promise<void> {
    await this.interactor.execute({
      customerId: body.customerId,
      items: body.items,
    });
  }
}
