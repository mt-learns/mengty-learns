import { InMemoryOrderGateway } from '../adapters/in-memory-order-gateway.js';
import { JsonOrderPresenter } from '../adapters/json-order-presenter.js';
import { OrderController } from '../adapters/order-controller.js';
import { PlaceOrderInteractor } from '../use-cases/place-order.js';

async function main(): Promise<void> {
  const gateway = new InMemoryOrderGateway();
  const presenter = new JsonOrderPresenter();
  const interactor = new PlaceOrderInteractor(gateway, presenter);
  const controller = new OrderController(interactor);

  await controller.handlePost({
    customerId: 'cust_1',
    items: [
      { sku: 'book-clean', priceCents: 3200, qty: 1 },
      { sku: 'bookmark', priceCents: 150, qty: 2 },
    ],
  });

  console.log('[clean] viewModel:', JSON.stringify(presenter.viewModel));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
