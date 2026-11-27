# Lab: Order Service Across 3 Architecture Styles (`layered`, `hexagonal`, `clean`)

## Goal

Implement the exact same **"Place Order"** use case in three side-by-side folders—`layered/`, `hexagonal/`, and `clean/`—so you can compare folder layouts, dependency directions, and testability directly in TypeScript.

## Folder Structure & Dependency Direction Comparison

| Style | Folder Layout | Dependency Direction | What Tests Show |
|---|---|---|---|
| **Layered** (`layered/`) | `presentation/` → `business/` → `data/` | **Top-down:** `OrderController` → `OrderService` → `OrderRepo` | Minimal boilerplate for simple CRUD; `OrderService` directly imports `OrderRepo`. |
| **Hexagonal** (`hexagonal/`) | `core/` (`domain/`, `ports/`) ← `adapters/` (`driving/`, `driven/`) | **Inward:** `RestOrderAdapter` and `PostgresOrderRepo` / `InMemoryOrderRepo` depend on `core/ports/*` | `PlaceOrderService` runs identically in tests by swapping `PostgresOrderRepo` for `InMemoryOrderRepo` with zero database. |
| **Clean** (`clean/`) | `entities/` ← `use-cases/` ← `adapters/` ← `frameworks/` | **Strictly inward:** `OrderController`, `JsonOrderPresenter`, and `InMemoryOrderGateway` depend on `use-cases/` ports and `entities/` | `PlaceOrderInteractor` is tested with an in-memory gateway and a spy `OrderPresenter` without touching entities or controllers. |

## Prerequisites

- Node.js `22+` and `npm`

## Steps

1. Install dependencies, typecheck, and run all 3 test suites:

   ```bash
   cd labs/arch-order-service
   npm install
   npm run typecheck
   npm test
   ```

2. Run each style's CLI entry point:

   ```bash
   npm run start:layered
   npm run start:hexagonal
   npm run start:clean
   ```

## Expected Output

- `npm test` passes 6 tests across `layered/test/layered.test.ts`, `hexagonal/test/hexagonal.test.ts`, and `clean/test/clean.test.ts`.
- Each `start:*` script prints the created order response (and for `hexagonal`, the simulated SQL `INSERT` statement from `PostgresOrderRepo`).

## Try This Next

1. **Add a CLI driving adapter to `hexagonal/`:** Create `hexagonal/src/adapters/driving/cli-order-adapter.ts` that calls `PlaceOrderPort` without modifying `hexagonal/src/core/`.
2. **Add a discount rule:** Enforce a 10% discount for orders over `$50.00` in all three styles and compare which files you have to touch in each folder.
