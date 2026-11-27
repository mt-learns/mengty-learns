import type { OrderItem } from '../../core/domain/order.js';
import type { PlaceOrderPort } from '../../core/ports/place-order-port.js';

/**
 * Driving Adapter: translates HTTP-like requests into the inbound PlaceOrderPort.
 */
export class RestOrderAdapter {
  constructor(private readonly placeOrder: PlaceOrderPort) {}

  async handlePost(body: { customerId: string; items: OrderItem[] }) {
    const order = await this.placeOrder.execute(body.customerId, body.items);
    return { status: 201, data: order };
  }
}
