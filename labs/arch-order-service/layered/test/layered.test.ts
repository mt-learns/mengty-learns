import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OrderService } from '../src/business/order-service.js';
import { OrderRepo } from '../src/data/order-repo.js';
import { OrderController } from '../src/presentation/order-controller.js';

describe('Layered Architecture: Order service', () => {
  it('wires Controller -> Service -> Repo with minimal boilerplate', async () => {
    const repo = new OrderRepo();
    const service = new OrderService(repo);
    const controller = new OrderController(service);

    const res = await controller.handlePost({
      customerId: 'cust_1',
      items: [
        { priceCents: 1500, qty: 2 },
        { priceCents: 400, qty: 1 },
      ],
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.customerId, 'cust_1');
    assert.equal(res.data.totalCents, 3400);
    assert.ok(await repo.findById(res.data.id));
  });

  it('rejects empty orders in the Business layer', async () => {
    const service = new OrderService(new OrderRepo());
    await assert.rejects(
      () => service.placeOrder('cust_1', []),
      /at least one item/,
    );
  });
});
