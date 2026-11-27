import { CsvDriver } from './drivers/csv-driver.js';
import { PostgresDriver } from './drivers/postgres-driver.js';
import { AsyncExporter } from './exporters/async-exporter.js';
import { OrderExporter } from './exporters/order-exporter.js';

async function main(): Promise<void> {
  const pgExporter = new OrderExporter(new PostgresDriver());
  const pgReceipt = await pgExporter.exportOrder({ id: 'ord_1', totalCents: 2500 });
  console.log('Single export (Postgres):', pgReceipt);

  const csvDriver = new CsvDriver();
  const csvBatch = new AsyncExporter(csvDriver);
  const csvReceipts = await csvBatch.exportBatch([
    { id: 'ord_2', totalCents: 1200 },
    { id: 'ord_3', totalCents: 4900 },
  ]);
  console.log('Batch export (CSV):', csvReceipts);
  console.log('CSV rows buffered:', csvDriver.getRows().length);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
