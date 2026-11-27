# Lab: Bridge Pattern (`OrderExporter` × `StorageDriver`)

## Goal

Separate an **Abstraction** (`OrderExporter`, `AsyncExporter`) from its **Implementation** (`StorageDriver`: `PostgresDriver`, `CsvDriver`) using composition instead of inheritance, so either side can grow without creating `M × N` subclasses.

## Structure

- `src/drivers/storage-driver.ts` — `StorageDriver` interface (Implementor)
- `src/drivers/postgres-driver.ts` — `PostgresDriver` concrete implementation
- `src/drivers/csv-driver.ts` — `CsvDriver` concrete implementation
- `src/exporters/order-exporter.ts` — `OrderExporter` abstraction
- `src/exporters/async-exporter.ts` — `AsyncExporter` refined abstraction
- `src/index.ts` — runnable example pairing exporters with drivers
- `test/bridge.test.ts` — `node:test` suite proving both hierarchies extend independently

## Prerequisites

- Node.js `22+` and `npm`

## Steps

1. Install dependencies, typecheck, and run the test suite:

   ```bash
   cd labs/bridge-pattern-ts
   npm install
   npm run typecheck
   npm test
   ```

2. Run the example script:

   ```bash
   npm start
   ```

## Expected Output

`npm test` passes all 4 tests covering single exports, batch exports, adding a new `StorageDriver` without touching `OrderExporter`/`AsyncExporter`, and adding a new `OrderExporter` subclass without touching any driver.

`npm start` prints:

```text
Single export (Postgres): pg:orders:ord_1
Batch export (CSV): [ 'csv:row-1', 'csv:row-2' ]
CSV rows buffered: 2
```

## Try This Next

1. **Add a new driver:** Create `src/drivers/json-lines-driver.ts` implementing `StorageDriver` and pass it to `AsyncExporter` without editing `src/exporters/`.
2. **Add a new exporter:** Create `src/exporters/filtered-exporter.ts` extending `OrderExporter` (for example, skipping orders under `1000` cents) and run it against both `PostgresDriver` and `CsvDriver` without editing `src/drivers/`.
