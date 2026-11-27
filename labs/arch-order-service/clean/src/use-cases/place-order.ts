import { Order, type OrderItem } from '../entities/order.js';

export interface PlaceOrderRequest {
  customerId: string;
  items: OrderItem[];
}

export interface PlaceOrderResponse {
  orderId: string;
  totalCents: number;
}

export interface OrderGateway {
  save(order: Order): Promise<Order>;
}

export interface OrderPresenter {
  present(res: PlaceOrderResponse): void;
}

/**
 * Use Case Interactor: orchestrates Order entity and calls Output Ports.
 */
export class PlaceOrderInteractor {
  constructor(
    private readonly gateway: OrderGateway,
    private readonly presenter: OrderPresenter,
  ) {}

  async execute(req: PlaceOrderRequest): Promise<void> {
    const order = Order.create(req.customerId, req.items);
    const saved = await this.gateway.save(order);
    this.presenter.present({ orderId: saved.id, totalCents: saved.totalCents });
  }
}
