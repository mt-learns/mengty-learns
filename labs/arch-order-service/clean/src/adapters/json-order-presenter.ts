import type { OrderPresenter, PlaceOrderResponse } from '../use-cases/place-order.js';

export interface OrderViewModel {
  status: number;
  body: {
    orderId: string;
    totalFormatted: string;
  };
}

/**
 * Interface Adapter (Presenter): formats Use Case OutputData into a ViewModel.
 */
export class JsonOrderPresenter implements OrderPresenter {
  public viewModel: OrderViewModel | null = null;

  present(res: PlaceOrderResponse): void {
    this.viewModel = {
      status: 201,
      body: {
        orderId: res.orderId,
        totalFormatted: `$${(res.totalCents / 100).toFixed(2)}`,
      },
    };
  }
}
