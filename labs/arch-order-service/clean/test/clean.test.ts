import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { InMemoryOrderGateway } from '../src/adapters/in-memory-order-gateway.js';
import { JsonOrderPresenter } from '../src/adapters/json-order-presenter.js';
import { OrderController } from '../src/adapters/order-controller.js';
import { PlaceOrderInteractor, type OrderPresenter, type PlaceOrderResponse } from '../src/use-cases/place-order.js';

describe('Clean Architecture: Order service', () => {
  it('tests PlaceOrderInteractor with an InMemoryOrderGateway and spy Presenter', async () => {
    const gateway = new InMemoryOrderGateway();
    let captured: PlaceOrderResponse | undefined;
    const spyPresenter: OrderPresenter = {
      present(res) {
        captured = res;
      },
    };

    const interactor = new PlaceOrderInteractor(gateway, spyPresenter);
    await interactor.execute({
      customerId: 'cust_1',
      items: [{ sku: 'book-clean', priceCents: 3500, qty: 1 }],
    });

    assert.ok(captured);
    assert.equal(captured.totalCents, 3500);
    assert.equal(gateway.saved.size, 1);
  });

  it('formats output via JsonOrderPresenter without touching Interactor or Entity', async () => {
    const gateway = new InMemoryOrderGateway();
    const presenter = new JsonOrderPresenter();
    const controller = new OrderController(new PlaceOrderInteractor(gateway, presenter));

    await controller.handlePost({
      customerId: 'cust_2',
      items: [
        { sku: 'course', priceCents: 2000, qty: 2 },
        { sku: 'note', priceCents: 500, qty: 1 },
      ],
    });

    assert.equal(presenter.viewModel?.status, 201);
    assert.equal(presenter.viewModel?.body.totalFormatted, '$45.00');
  });
});
