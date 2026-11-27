import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { InMemoryOrderRepo } from '../src/adapters/driven/in-memory-order-repo.js';
import { PostgresOrderRepo } from '../src/adapters/driven/postgres-order-repo.js';
import { RestOrderAdapter } from '../src/adapters/driving/rest-order-adapter.js';
import { PlaceOrderService } from '../src/core/place-order-service.js';

describe('Hexagonal Architecture: Order service', () => {
  it('swaps PostgresOrderRepo for InMemoryOrderRepo in tests with zero database', async () => {
    const memRepo = new InMemoryOrderRepo();
    const core = new PlaceOrderService(memRepo);

    const order = await core.execute('cust_1', [
      { sku: 'book-ts', priceCents: 2500, qty: 1 },
      { sku: 'pen', priceCents: 200, qty: 3 },
    ]);

    assert.equal(order.totalCents, 3100);
    assert.equal(memRepo.store.size, 1);
    assert.deepEqual(memRepo.store.get(order.id), order);
  });

  it('runs the exact same core from a Driving REST adapter and Postgres adapter', async () => {
    const pgRepo = new PostgresOrderRepo();
    const core = new PlaceOrderService(pgRepo);
    const rest = new RestOrderAdapter(core);

    const res = await rest.handlePost({
      customerId: 'cust_2',
      items: [{ sku: 'mug', priceCents: 1500, qty: 2 }],
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.totalCents, 3000);
    assert.equal(pgRepo.executedStatements.length, 1);
  });
});
