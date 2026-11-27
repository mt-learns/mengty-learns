import { PostgresOrderRepo } from './adapters/driven/postgres-order-repo.js';
import { RestOrderAdapter } from './adapters/driving/rest-order-adapter.js';
import { PlaceOrderService } from './core/place-order-service.js';

async function main(): Promise<void> {
  const repo = new PostgresOrderRepo();
  const service = new PlaceOrderService(repo);
  const rest = new RestOrderAdapter(service);

  const res = await rest.handlePost({
    customerId: 'cust_1',
    items: [
      { sku: 'book-ts', priceCents: 2500, qty: 1 },
      { sku: 'sticker', priceCents: 300, qty: 2 },
    ],
  });

  console.log('[hexagonal] response:', JSON.stringify(res));
  console.log('[hexagonal] sql:', repo.executedStatements[0]);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
