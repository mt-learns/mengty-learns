import { OrderService } from './business/order-service.js';
import { OrderRepo } from './data/order-repo.js';
import { OrderController } from './presentation/order-controller.js';

async function main(): Promise<void> {
  const repo = new OrderRepo();
  const service = new OrderService(repo);
  const controller = new OrderController(service);

  const res = await controller.handlePost({
    customerId: 'cust_1',
    items: [
      { priceCents: 1200, qty: 2 },
      { priceCents: 500, qty: 1 },
    ],
  });

  console.log('[layered] response:', JSON.stringify(res));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
