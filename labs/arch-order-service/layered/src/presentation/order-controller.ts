import { OrderService, type OrderItemInput } from '../business/order-service.js';

/**
 * Presentation Layer: handles HTTP-like request/response mapping.
 */
export class OrderController {
  constructor(private readonly service: OrderService) {}

  async handlePost(body: { customerId: string; items: OrderItemInput[] }) {
    const order = await this.service.placeOrder(body.customerId, body.items);
    return { status: 201, data: order };
  }
}
