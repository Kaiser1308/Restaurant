# Day 22-24 Print Jobs and Mock Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the current Phase 1 codebase into compliance with the new architecture guardrails, then implement Day 22-24: print job schema/API, print job creation from kitchen and bill flows, and print-agent Mock mode polling.

**Architecture:** First remove existing guardrail violations in this phase: frontend cross-feature access must go through feature `index.ts` public APIs, and backend service write paths must use required tenant context helpers instead of nullable context fallbacks. Keep API layering as Controller -> Service -> Repository. The API creates print jobs only as database work; the print agent owns polling and status transitions.

**Tech Stack:** ASP.NET Core Web API (.NET 9), EF Core + PostgreSQL, .NET Worker Service, System.Text.Json, HttpClient.

---

## Scope

Allowed:
- Fix current architecture guardrail violations so `scripts/verify-architecture.ps1` passes before print-job work expands.
- Update frontend feature public exports and imports to avoid cross-feature deep imports.
- Add tenant context require helpers and replace direct nullable tenant context reads in backend service write paths.
- Add backend print job entity, enums, repository, service, controller, DTOs, validator, config, migration.
- Update existing order and bill write paths to create print jobs in the same database transaction/work unit.
- Update print-agent worker to poll the API and log tickets in Mock mode.

Not allowed without updating this plan first:
- Route shape changes outside `/api/print-jobs`.
- New frontend screens.
- SignalR implementation.
- ESC/POS real printer implementation.
- New cross-domain feature module.
- Exception taxonomy redesign.

## Files

Create:
- `apps/api/Restaurant.Api/Domain/Entities/PrintJob.cs`
- `apps/api/Restaurant.Api/Domain/Enums/PrinterType.cs`
- `apps/api/Restaurant.Api/Domain/Enums/PrintJobStatus.cs`
- `apps/api/Restaurant.Api/DTOs/PrintJobs/PrintJobResponse.cs`
- `apps/api/Restaurant.Api/DTOs/PrintJobs/MarkPrintJobFailedRequest.cs`
- `apps/api/Restaurant.Api/DTOs/PrintJobs/PrintAgentOptions.cs`
- `apps/api/Restaurant.Api/Repositories/IPrintJobRepository.cs`
- `apps/api/Restaurant.Api/Repositories/PrintJobRepository.cs`
- `apps/api/Restaurant.Api/Services/IPrintJobService.cs`
- `apps/api/Restaurant.Api/Services/PrintJobService.cs`
- `apps/api/Restaurant.Api/Controllers/PrintJobsController.cs`
- `apps/api/Restaurant.Api/Validators/MarkPrintJobFailedRequestValidator.cs`
- `apps/api/Restaurant.Api/Infrastructure/Persistence/Migrations/<timestamp>_AddPrintJobs.cs`
- `apps/print-agent/Restaurant.PrintAgent/PrintAgentOptions.cs`
- `apps/print-agent/Restaurant.PrintAgent/PrintJobClient.cs`
- `apps/print-agent/Restaurant.PrintAgent/PrintJobModels.cs`
- `apps/print-agent/Restaurant.PrintAgent/TicketFormatter.cs`

Modify:
- `apps/web/src/features/auth/index.ts`
- `apps/web/src/features/auth/api/index.ts`
- `apps/web/src/features/auth/hooks/index.ts`
- `apps/web/src/features/auth/types/index.ts`
- `apps/web/src/features/audit/hooks/useAudit.ts`
- `apps/web/src/features/bills/hooks/useBills.ts`
- `apps/web/src/features/menu/hooks/useMenuData.ts`
- `apps/web/src/features/orders/hooks/useOrders.ts`
- `apps/web/src/features/tables/hooks/useTables.ts`
- `apps/web/src/components/ProtectedRoute.tsx`
- `apps/web/src/layouts/OwnerLayout.tsx`
- `apps/web/src/pages/HomeRedirect.tsx`
- `apps/web/src/pages/LoginPage.tsx`
- `apps/web/src/pages/cashier/CashierPaymentPage.tsx`
- `apps/web/src/pages/cashier/CashierTablesPage.tsx`
- `apps/web/src/pages/owner/OwnerDashboardPage.tsx`
- `apps/web/src/pages/shared/BillDetailPage.tsx`
- `apps/web/src/pages/waiter/WaiterOrderPage.tsx`
- `apps/web/src/pages/waiter/WaiterTablesPage.tsx`
- `apps/api/Restaurant.Api/Infrastructure/Persistence/RestaurantDbContext.cs`
- `apps/api/Restaurant.Api/Domain/Entities/Tenant.cs`
- `apps/api/Restaurant.Api/Infrastructure/Auth/ITenantContext.cs`
- `apps/api/Restaurant.Api/Infrastructure/Auth/TenantContext.cs`
- `apps/api/Restaurant.Api/Program.cs`
- `apps/api/Restaurant.Api/appsettings.Development.json`
- `apps/api/Restaurant.Api/Services/TableService.cs`
- `apps/api/Restaurant.Api/Services/CategoryService.cs`
- `apps/api/Restaurant.Api/Services/MenuItemService.cs`
- `apps/api/Restaurant.Api/DTOs/Orders/SendToKitchenResponse.cs`
- `apps/api/Restaurant.Api/DTOs/Bills/PayOrderResponse.cs`
- `apps/api/Restaurant.Api/Repositories/IOrderRepository.cs`
- `apps/api/Restaurant.Api/Repositories/OrderRepository.cs`
- `apps/api/Restaurant.Api/Repositories/IBillRepository.cs`
- `apps/api/Restaurant.Api/Repositories/BillRepository.cs`
- `apps/api/Restaurant.Api/Services/OrderService.cs`
- `apps/api/Restaurant.Api/Services/BillService.cs`
- `apps/print-agent/Restaurant.PrintAgent/Program.cs`
- `apps/print-agent/Restaurant.PrintAgent/Worker.cs`
- `apps/print-agent/Restaurant.PrintAgent/appsettings.Development.json`

Verification commands:
- `cmd.exe /c "dotnet build apps\\api\\Restaurant.Api\\Restaurant.Api.csproj"`
- `cmd.exe /c "cd apps\\web && npm run build"`
- `cmd.exe /c "dotnet build apps\\print-agent\\Restaurant.PrintAgent\\Restaurant.PrintAgent.csproj"`
- `powershell -ExecutionPolicy Bypass -File scripts/verify-architecture.ps1`
- Manual E2E: `docker compose up -d`, API run, print-agent run, send order to kitchen, confirm pending job is logged and marked printed.

---

### Task 0: Safety And Impact Prep

**Files:**
- Modify only this plan if scope changes.

- [ ] **Step 1: Confirm current branch and dirty files**

Run:

```powershell
git status --short
```

Expected: note existing user changes and do not revert them.

- [ ] **Step 2: Review affected touchpoints before editing existing symbols**

Review these known touchpoints before making changes:

```powershell
rg "RestaurantDbContext|Tenant|ITenantContext|TenantContext|TableService|CategoryService|MenuItemService|SendToKitchenAsync|PayOrderAsync|ExecuteAsync" apps
```

Expected: use the results to keep edits within the planned backend, web, and print-agent touchpoints.

- [ ] **Step 3: Check architecture verifier before cleanup**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-architecture.ps1
```

Expected before Task 1: it may fail on current web deep imports and direct tenant context access. These are no longer accepted as final baseline; Task 1 and Task 2 must remove them inside this phase.

---

### Task 1: Frontend Public API Guardrail Cleanup

**Files:**
- Modify: `apps/web/src/features/auth/index.ts`
- Modify: `apps/web/src/features/auth/api/index.ts`
- Modify: `apps/web/src/features/auth/hooks/index.ts`
- Modify: `apps/web/src/features/auth/types/index.ts`
- Modify: `apps/web/src/features/audit/hooks/useAudit.ts`
- Modify: `apps/web/src/features/bills/hooks/useBills.ts`
- Modify: `apps/web/src/features/menu/hooks/useMenuData.ts`
- Modify: `apps/web/src/features/orders/hooks/useOrders.ts`
- Modify: `apps/web/src/features/tables/hooks/useTables.ts`
- Modify: `apps/web/src/components/ProtectedRoute.tsx`
- Modify: `apps/web/src/layouts/OwnerLayout.tsx`
- Modify: `apps/web/src/pages/HomeRedirect.tsx`
- Modify: `apps/web/src/pages/LoginPage.tsx`
- Modify: `apps/web/src/pages/cashier/CashierPaymentPage.tsx`
- Modify: `apps/web/src/pages/cashier/CashierTablesPage.tsx`
- Modify: `apps/web/src/pages/owner/OwnerDashboardPage.tsx`
- Modify: `apps/web/src/pages/shared/BillDetailPage.tsx`
- Modify: `apps/web/src/pages/waiter/WaiterOrderPage.tsx`
- Modify: `apps/web/src/pages/waiter/WaiterTablesPage.tsx`

- [ ] **Step 1: Export auth public API**

Ensure `apps/web/src/features/auth/index.ts` exports the values external code currently imports:

```typescript
export * from './api'
export * from './hooks'
export * from './types'
export { canManageMenu, canManageTables, getDefaultPathByRole } from './utils/roleAccess'
```

- [ ] **Step 2: Keep intra-feature hook imports relative**

Change hook files inside a feature so they import their own API through relative paths, not `@/features/.../api/...`.

Examples:

```typescript
import { auditApi } from '../api/auditApi'
import { billsApi } from '../api/billsApi'
import { menuApi } from '../api/menuApi'
import { ordersApi } from '../api/ordersApi'
import { tablesApi } from '../api/tablesApi'
```

For `apps/web/src/features/orders/hooks/useOrders.ts`, cross-feature use of tables must import from the tables public API:

```typescript
import { tablesApi } from '@/features/tables'
```

- [ ] **Step 3: Change external feature imports to public APIs**

Replace external imports like:

```typescript
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getDefaultPathByRole } from '@/features/auth/utils/roleAccess'
import { billsApi } from '@/features/bills/api/billsApi'
```

with public API imports:

```typescript
import { getDefaultPathByRole, useAuth } from '@/features/auth'
import { billsApi } from '@/features/bills'
```

Apply this pattern to all page/layout/component files listed in this task.

- [ ] **Step 4: Build web**

Run:

```powershell
cmd.exe /c "cd apps\\web && npm run build"
```

Expected: TypeScript and Vite build pass.

- [ ] **Step 5: Verify architecture has no web deep imports**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-architecture.ps1
```

Expected: no `Cross-feature deep import` violations remain. Backend tenant context violations may still remain until Task 2.

Commit after task:

```powershell
git add apps/web/src
git commit -m "chore: align web imports with feature public APIs"
```

---

### Task 2: Backend Tenant Context Guardrail Cleanup

**Files:**
- Modify: `apps/api/Restaurant.Api/Infrastructure/Auth/ITenantContext.cs`
- Modify: `apps/api/Restaurant.Api/Infrastructure/Auth/TenantContext.cs`
- Modify: `apps/api/Restaurant.Api/Services/TableService.cs`
- Modify: `apps/api/Restaurant.Api/Services/CategoryService.cs`
- Modify: `apps/api/Restaurant.Api/Services/MenuItemService.cs`
- Modify: `apps/api/Restaurant.Api/Services/OrderService.cs`
- Modify: `apps/api/Restaurant.Api/Services/BillService.cs`

- [ ] **Step 1: Add required context methods**

Add these members to `ITenantContext`:

```csharp
Guid RequireTenantId();
Guid RequireUserId();
UserRole RequireRole();
```

- [ ] **Step 2: Implement required context methods**

In `TenantContext`, implement them using `UnauthorizedException`:

```csharp
public Guid RequireTenantId()
    => TenantId ?? throw new UnauthorizedException();

public Guid RequireUserId()
    => UserId ?? throw new UnauthorizedException();

public UserRole RequireRole()
    => Role ?? throw new UnauthorizedException();
```

Add the required `using Restaurant.Api.Common.Exceptions;`.

- [ ] **Step 3: Replace tenant id writes**

In `TableService`, `CategoryService`, `MenuItemService`, `OrderService`, and `BillService`, replace all service write-path patterns like:

```csharp
tenantContext.TenantId ?? Guid.Empty
tenantContext.TenantId ?? throw new UnauthorizedException()
```

with:

```csharp
tenantContext.RequireTenantId()
```

When the method needs the value more than once, assign it once near the top of the write path:

```csharp
var tenantId = tenantContext.RequireTenantId();
```

- [ ] **Step 4: Replace user id and role writes**

Replace:

```csharp
tenantContext.UserId ?? Guid.Empty
tenantContext.UserId ?? throw new UnauthorizedException()
tenantContext.Role ?? throw new UnauthorizedException()
```

with:

```csharp
tenantContext.RequireUserId()
tenantContext.RequireRole()
```

For optional audit log user ids, do not read `tenantContext.UserId` directly in service write paths. Pass the required user id from the calling write method into the audit helper, or make the audit helper call `tenantContext.RequireUserId()` when audit records must be user-attributed.

- [ ] **Step 5: Build API**

Run:

```powershell
cmd.exe /c "dotnet build apps\\api\\Restaurant.Api\\Restaurant.Api.csproj"
```

Expected: build passes.

- [ ] **Step 6: Verify architecture passes after cleanup**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-architecture.ps1
```

Expected: architecture verification passes before Day 22 print-job work begins.

Commit after task:

```powershell
git add apps/api/Restaurant.Api/Infrastructure/Auth apps/api/Restaurant.Api/Services
git commit -m "chore: align service write paths with tenant context guardrails"
```

---

### Task 3: Day 22 Print Job Schema

**Files:**
- Create: `apps/api/Restaurant.Api/Domain/Entities/PrintJob.cs`
- Create: `apps/api/Restaurant.Api/Domain/Enums/PrinterType.cs`
- Create: `apps/api/Restaurant.Api/Domain/Enums/PrintJobStatus.cs`
- Modify: `apps/api/Restaurant.Api/Domain/Entities/Tenant.cs`
- Modify: `apps/api/Restaurant.Api/Infrastructure/Persistence/RestaurantDbContext.cs`
- Create migration: `apps/api/Restaurant.Api/Infrastructure/Persistence/Migrations/<timestamp>_AddPrintJobs.cs`

- [ ] **Step 1: Add enums**

Create `PrinterType` with `Kitchen`, `Cashier`, `KitchenCancel`.
Create `PrintJobStatus` with `Pending`, `Printing`, `Printed`, `Failed`.

- [ ] **Step 2: Add PrintJob entity**

Fields must match `DB_SCHEMA_V1.md`: `Id`, `TenantId`, `EntityType`, `EntityId`, `PrinterType`, `PrintKey`, `Status`, `ContentJson`, `ErrorMessage`, `RetryCount`, `PrintedAt`, `CreatedAt`, `UpdatedAt`, plus `Tenant` navigation.

- [ ] **Step 3: Add Tenant navigation**

Add `ICollection<PrintJob> PrintJobs` to `Tenant`.

- [ ] **Step 4: Configure EF**

In `RestaurantDbContext`, add `DbSet<PrintJob> PrintJobs`.
Configure:
- `EntityType` max 50 required.
- `PrinterType` string conversion max 50.
- `PrintKey` max 200 required.
- `Status` string conversion max 50 default `Pending`.
- `ContentJson` required.
- `ErrorMessage` max 2000.
- unique index `(TenantId, PrintKey)`.
- indexes `(TenantId, Status)`, `(TenantId, PrinterType, Status)`, `(TenantId, CreatedAt)`.
- restrict delete to `Tenant`.
- tenant query filter consistent with other tenant business tables.

- [ ] **Step 5: Create migration**

Run:

```powershell
cmd.exe /c "dotnet ef migrations add AddPrintJobs --project apps\\api\\Restaurant.Api"
```

Expected: migration creates `print_jobs` with snake_case columns and required indexes.

- [ ] **Step 6: Build API**

Run:

```powershell
cmd.exe /c "dotnet build apps\\api\\Restaurant.Api\\Restaurant.Api.csproj"
```

Expected: build passes.

Commit after task:

```powershell
git add apps/api/Restaurant.Api
git commit -m "feat: add print job schema"
```

---

### Task 4: Day 22 Print Job Repository, Service, And API

**Files:**
- Create: `apps/api/Restaurant.Api/DTOs/PrintJobs/PrintJobResponse.cs`
- Create: `apps/api/Restaurant.Api/DTOs/PrintJobs/MarkPrintJobFailedRequest.cs`
- Create: `apps/api/Restaurant.Api/DTOs/PrintJobs/PrintAgentOptions.cs`
- Create: `apps/api/Restaurant.Api/Repositories/IPrintJobRepository.cs`
- Create: `apps/api/Restaurant.Api/Repositories/PrintJobRepository.cs`
- Create: `apps/api/Restaurant.Api/Services/IPrintJobService.cs`
- Create: `apps/api/Restaurant.Api/Services/PrintJobService.cs`
- Create: `apps/api/Restaurant.Api/Controllers/PrintJobsController.cs`
- Create: `apps/api/Restaurant.Api/Validators/MarkPrintJobFailedRequestValidator.cs`
- Modify: `apps/api/Restaurant.Api/Program.cs`
- Modify: `apps/api/Restaurant.Api/appsettings.Development.json`

- [ ] **Step 1: Add DTOs**

`PrintJobResponse` must return `id`, `tenantId`, `entityType`, `entityId`, `printerType`, `printKey`, `status`, `contentJson`, `errorMessage`, `retryCount`, `printedAt`, `createdAt`, `updatedAt`.
`MarkPrintJobFailedRequest` must contain `ErrorMessage`.
`PrintAgentOptions` must contain `AgentKey`.

- [ ] **Step 2: Add validator**

Validate `ErrorMessage` is non-empty and max 2000 characters.

- [ ] **Step 3: Add repository**

Repository methods:
- `GetPendingAsync(PrinterType? printerType, int limit, CancellationToken cancellationToken)`
- `GetByIdAsync(Guid id, CancellationToken cancellationToken)`
- `SaveChangesAsync(CancellationToken cancellationToken)`

Pending query must filter `Status == Pending`, optionally filter `PrinterType`, order by `CreatedAt`, cap `limit` between 1 and 50.

- [ ] **Step 4: Add service**

Service methods:
- `GetPendingAsync(string? printerType, int limit, CancellationToken cancellationToken)`
- `MarkPrintingAsync(Guid id, CancellationToken cancellationToken)`
- `MarkPrintedAsync(Guid id, CancellationToken cancellationToken)`
- `MarkFailedAsync(Guid id, MarkPrintJobFailedRequest request, CancellationToken cancellationToken)`

Rules:
- invalid `printerType` returns business error.
- missing job returns 404.
- mark printing allowed only from `Pending` or `Failed`.
- mark printed sets status `Printed`, clears error, sets `PrintedAt`, updates `UpdatedAt`.
- mark failed sets status `Failed`, stores trimmed error, increments `RetryCount`, updates `UpdatedAt`.

- [ ] **Step 5: Add API key guard in controller**

Use `X-Print-Agent-Key`. Compare against `PrintAgent:AgentKey`. Return 401 if missing or mismatched.

- [ ] **Step 6: Add controller routes**

Routes:
- `GET /api/print-jobs/pending?printerType=&limit=10`
- `POST /api/print-jobs/{id}/mark-printing`
- `POST /api/print-jobs/{id}/mark-printed`
- `POST /api/print-jobs/{id}/mark-failed`

- [ ] **Step 7: Register dependencies and config**

In `Program.cs`, register `IPrintJobRepository`, `IPrintJobService`, and configure `PrintAgentOptions`.
In `appsettings.Development.json`, add:

```json
"PrintAgent": {
  "AgentKey": "dev_print_agent_key"
}
```

- [ ] **Step 8: Build API**

Run:

```powershell
cmd.exe /c "dotnet build apps\\api\\Restaurant.Api\\Restaurant.Api.csproj"
```

Expected: build passes.

Commit after task:

```powershell
git add apps/api/Restaurant.Api
git commit -m "feat: add print job polling endpoints"
```

---

### Task 5: Day 23 Integrate Kitchen Print Job Into Order Flow

**Files:**
- Modify: `apps/api/Restaurant.Api/DTOs/Orders/SendToKitchenResponse.cs`
- Modify: `apps/api/Restaurant.Api/Repositories/IOrderRepository.cs`
- Modify: `apps/api/Restaurant.Api/Repositories/OrderRepository.cs`
- Modify: `apps/api/Restaurant.Api/Services/OrderService.cs`

- [ ] **Step 1: Update response contract**

Change `SendToKitchenResponse` to include `Guid PrintJobId`, matching `API_CONTRACT_V1.md`.

- [ ] **Step 2: Add repository method**

Add `AddPrintJobAsync(PrintJob printJob, CancellationToken cancellationToken = default)` to `IOrderRepository` and `OrderRepository`.

- [ ] **Step 3: Build kitchen print content**

In `SendToKitchenAsync`, after pending item validation and before saving, create one `PrintJob` with:
- `TenantId` from `tenantContext.RequireTenantId()`.
- `EntityType = "order"`.
- `EntityId = order.Id`.
- `PrinterType = PrinterType.Kitchen`.
- `Status = PrintJobStatus.Pending`.
- `PrintKey = $"kitchen:{order.Id}:{now:yyyyMMddHHmmssfffffff}"`.
- `ContentJson` serialized JSON containing table name if loaded, order id, sent timestamp, and only newly sent pending items with item name, quantity, unit price, line total.

If table name is not loaded by `GetByIdAsync`, update repository include to include `Table`.

- [ ] **Step 4: Save in same write operation**

Add the print job before `SaveChangesAsync`. Keep audit log in the same save.

- [ ] **Step 5: Return print job id**

Return `new SendToKitchenResponse(order.Id, order.Status.ToString(), printJob.Id)`.

- [ ] **Step 6: Build API**

Run:

```powershell
cmd.exe /c "dotnet build apps\\api\\Restaurant.Api\\Restaurant.Api.csproj"
```

Expected: build passes.

Commit after task:

```powershell
git add apps/api/Restaurant.Api
git commit -m "feat: create kitchen print jobs"
```

---

### Task 6: Day 23 Integrate Cashier Print Job Into Bill Flow

**Files:**
- Modify: `apps/api/Restaurant.Api/DTOs/Bills/PayOrderResponse.cs`
- Modify: `apps/api/Restaurant.Api/Repositories/IBillRepository.cs`
- Modify: `apps/api/Restaurant.Api/Repositories/BillRepository.cs`
- Modify: `apps/api/Restaurant.Api/Services/BillService.cs`

- [ ] **Step 1: Update response contract**

Change `PayOrderResponse` to include `Guid PrintJobId`, matching `API_CONTRACT_V1.md`.

- [ ] **Step 2: Add repository method**

Add `AddPrintJobAsync(PrintJob printJob, CancellationToken cancellationToken = default)` to `IBillRepository` and `BillRepository`.

- [ ] **Step 3: Build cashier print content**

In `PayOrderAsync`, create one `PrintJob` after the bill object is created:
- `TenantId = tenantId`.
- `EntityType = "bill"`.
- `EntityId = bill.Id`.
- `PrinterType = PrinterType.Cashier`.
- `Status = PrintJobStatus.Pending`.
- `PrintKey = $"cashier:{bill.Id}"`.
- `ContentJson` serialized JSON containing bill number, table name, payment type, total amount, paid timestamp, and bill items with item name, quantity, unit price, line total.

- [ ] **Step 4: Save in same transaction**

Call `AddPrintJobAsync(printJob)` before `SaveChangesAsync`. Keep bill, bill items, order status, table status, print job, and audit log in the same transaction.

- [ ] **Step 5: Return print job id**

Return `PayOrderResponse` with `printJob.Id`.

- [ ] **Step 6: Build API**

Run:

```powershell
cmd.exe /c "dotnet build apps\\api\\Restaurant.Api\\Restaurant.Api.csproj"
```

Expected: build passes.

Commit after task:

```powershell
git add apps/api/Restaurant.Api
git commit -m "feat: create cashier print jobs"
```

---

### Task 7: Day 24 Print Agent Mock Polling

**Files:**
- Create: `apps/print-agent/Restaurant.PrintAgent/PrintAgentOptions.cs`
- Create: `apps/print-agent/Restaurant.PrintAgent/PrintJobClient.cs`
- Create: `apps/print-agent/Restaurant.PrintAgent/PrintJobModels.cs`
- Create: `apps/print-agent/Restaurant.PrintAgent/TicketFormatter.cs`
- Modify: `apps/print-agent/Restaurant.PrintAgent/Program.cs`
- Modify: `apps/print-agent/Restaurant.PrintAgent/Worker.cs`
- Modify: `apps/print-agent/Restaurant.PrintAgent/appsettings.Development.json`

- [ ] **Step 1: Fix development API base URL**

Set `PrintAgent:ApiBaseUrl` to `http://localhost:5141` in `appsettings.Development.json`.

- [ ] **Step 2: Add options model**

`PrintAgentOptions` fields:
- `string ApiBaseUrl`
- `string AgentKey`
- `int PollingIntervalSeconds`
- `string PrintMode`
- `string? PrinterType`
- `int Limit`

- [ ] **Step 3: Register HttpClient and options**

In `Program.cs`, configure `PrintAgentOptions`, register `HttpClient`, `PrintJobClient`, and `TicketFormatter`.

- [ ] **Step 4: Add API client**

`PrintJobClient` methods:
- `GetPendingAsync(CancellationToken cancellationToken)`
- `MarkPrintingAsync(Guid id, CancellationToken cancellationToken)`
- `MarkPrintedAsync(Guid id, CancellationToken cancellationToken)`
- `MarkFailedAsync(Guid id, string errorMessage, CancellationToken cancellationToken)`

Each request must include `X-Print-Agent-Key`.

- [ ] **Step 5: Add models**

`PrintJobResponse` mirrors API response fields required by the worker: `Id`, `PrinterType`, `ContentJson`, `RetryCount`, `CreatedAt`.
`MarkPrintJobFailedRequest` contains `ErrorMessage`.

- [ ] **Step 6: Add ticket formatter**

Formatter must parse `ContentJson` with `JsonDocument` and output a readable ticket:
- header with printer type.
- table or bill number when present.
- each item line with quantity and name.
- total when present.
- timestamps when present.

- [ ] **Step 7: Replace worker loop**

Worker loop:
- read options.
- poll pending jobs.
- for each job: mark printing, format ticket, log ticket, mark printed.
- if processing a job fails after it was fetched, call mark failed with exception message and continue.
- wait `PollingIntervalSeconds` between loops.

- [ ] **Step 8: Build print agent**

Run:

```powershell
cmd.exe /c "dotnet build apps\\print-agent\\Restaurant.PrintAgent\\Restaurant.PrintAgent.csproj"
```

Expected: build passes.

Commit after task:

```powershell
git add apps/print-agent/Restaurant.PrintAgent
git commit -m "feat: implement print agent mock mode"
```

---

### Task 8: End-To-End Verification

**Files:**
- No new files unless verification exposes a bug.

- [ ] **Step 1: Start PostgreSQL**

Run:

```powershell
docker compose up -d
```

Expected: PostgreSQL container is running.

- [ ] **Step 2: Start API**

Run in a terminal:

```powershell
cmd.exe /c "dotnet run --project apps\\api\\Restaurant.Api"
```

Expected: migrations apply and API listens on `http://localhost:5141`.

- [ ] **Step 3: Start print agent**

Run in another terminal:

```powershell
cmd.exe /c "dotnet run --project apps\\print-agent\\Restaurant.PrintAgent"
```

Expected: agent starts in Mock mode and polls `/api/print-jobs/pending`.

- [ ] **Step 4: Exercise kitchen flow**

Use existing UI or API flow to login as waiter, create/add items to an order, and send to kitchen.

Expected:
- send-to-kitchen response includes `printJobId`.
- print agent logs a kitchen ticket.
- print job status becomes `Printed`.

- [ ] **Step 5: Exercise cashier flow**

Login as cashier/owner and pay the order.

Expected:
- pay response includes `printJobId`.
- print agent logs a cashier bill ticket.
- print job status becomes `Printed`.

- [ ] **Step 6: Run final builds and architecture verification**

Run:

```powershell
cmd.exe /c "dotnet build apps\\api\\Restaurant.Api\\Restaurant.Api.csproj"
cmd.exe /c "cd apps\\web && npm run build"
cmd.exe /c "dotnet build apps\\print-agent\\Restaurant.PrintAgent\\Restaurant.PrintAgent.csproj"
powershell -ExecutionPolicy Bypass -File scripts/verify-architecture.ps1
```

Expected: all builds pass and architecture verification passes with zero violations.

- [ ] **Step 7: Review final diff before final commit**

Run:

```powershell
git diff --stat
git diff -- apps/web/src apps/api/Restaurant.Api apps/print-agent/Restaurant.PrintAgent
```

Expected: changed files are limited to web public API import cleanup, tenant context guardrail cleanup, print job API, order send-to-kitchen print integration, bill payment print integration, and print-agent worker polling.

Final commit if previous task commits were not used:

```powershell
git add apps/web/src apps/api/Restaurant.Api apps/print-agent/Restaurant.PrintAgent
git commit -m "feat: implement print job mock agent flow"
```

---

## Risk Notes

- `OrderService.SendToKitchenAsync` currently saves without an explicit transaction; adding the print job to the same `SaveChangesAsync` keeps a single EF unit of work, but if later repository operations require separate saves, add `BeginTransactionAsync` to `IOrderRepository`.
- `BillService.PayOrderAsync` already uses a transaction, so the cashier print job must stay inside it.
- `PrintKey` uniqueness prevents duplicate print jobs. Kitchen re-sends with newly pending items need a unique key per send batch; cashier bills can use bill id because each order has one bill.
- Architecture verifier failures are not accepted as final baseline in this phase. Task 1 and Task 2 must make `scripts/verify-architecture.ps1` pass before Day 22 print-job implementation continues.
