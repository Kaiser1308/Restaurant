# Architecture Refactor Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore architectural consistency across web, API, and print-agent without breaking current MVP flows.

**Architecture:** Execute the refactor in three independent workstreams ordered by risk and blast radius. Start with backend tenant-safety hardening, then split the web app composition boundaries, then complete the print-agent subsystem against the documented polling architecture.

**Tech Stack:** ASP.NET Core .NET 9, EF Core, React 19, TypeScript, TanStack Query, React Router, Vite, Worker Service.

---

## Scope Split

This refactor should not be executed as one large branch of mixed changes. Break it into three implementation plans and land them in this order:

1. `tenant-context-hardening`
2. `web-app-boundary-split`
3. `print-agent-job-polling`

Reasoning:
- Tenant hardening is the smallest, highest-safety fix and reduces data-integrity risk first.
- Web decomposition has the largest file churn but stays inside the frontend app.
- Print-agent completion is effectively a subsystem implementation, not just a cleanup.

## Target End State

When this roadmap is complete:
- API services fail fast when tenant or user context is missing.
- `App.tsx` is reduced to app bootstrap and top-level routing only.
- Each web feature exposes a small public API through `index.ts`.
- Cross-feature page composition lives in route/page modules, not in one god file.
- `features/pos` is either removed or renamed into a real product feature with clear ownership.
- Print-agent polls backend jobs, executes mock/real print strategies, and reports status changes.

## Workstream 1: Tenant Context Hardening

### Task 1: Define the fail-fast rule

**Files:**
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Infrastructure\Auth\ITenantContext.cs`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Infrastructure\Auth\TenantContext.cs`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Middleware\TenantContextMiddleware.cs`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\OrderService.cs`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\TableService.cs`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\CategoryService.cs`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\MenuItemService.cs`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\BillService.cs`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\restaurant_dotnet_docs\TECH_DECISIONS.md`

- [ ] Replace all business-write fallbacks from `Guid.Empty` to explicit failure.
- [ ] Decide the single rule: authenticated business operations require valid `tenantId`, and where applicable `userId`.
- [ ] Keep read-only anonymous endpoints out of scope. Only authenticated business flows should hard-fail.

### Task 2: Add one reusable access pattern

**Files:**
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Infrastructure\Auth\TenantContext.cs`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Infrastructure\Auth\ITenantContext.cs`
- Test: service tests to be added under `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api.Tests\`

- [ ] Introduce one consistent way to read required context, for example `RequireTenantId()` and `RequireUserId()` or equivalent helper methods.
- [ ] Keep exception type aligned with current API error handling, preferably `UnauthorizedException` or `ForbiddenException` depending on current semantics.
- [ ] Avoid duplicating null-check logic in every service method.

### Task 3: Migrate service methods incrementally

**Files:**
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\OrderService.cs`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\TableService.cs`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\CategoryService.cs`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\MenuItemService.cs`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\BillService.cs`

- [ ] Start with write paths only: create/update/pay/void/upload-image.
- [ ] Replace inline `tenantContext.TenantId ?? Guid.Empty` and `tenantContext.UserId ?? Guid.Empty` with the required-context helper.
- [ ] Keep method behavior otherwise unchanged.

### Task 4: Verify blast radius

**Files:**
- Verify: affected services and middleware

- [ ] Run `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`.
- [ ] Add or run tests for missing tenant/user context and confirm the API now fails instead of writing fake IDs.
- [ ] Re-check auth flows that intentionally rely on partial context, especially login/refresh endpoints.

## Workstream 2: Web App Boundary Split

### Task 1: Freeze the target structure

**Files:**
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\App.tsx`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\components\ProtectedRoute.tsx`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\layouts\WaiterLayout.tsx`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\layouts\CashierLayout.tsx`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\layouts\OwnerLayout.tsx`

- [ ] Keep `App.tsx` responsible only for providers and app router mounting.
- [ ] Introduce route/page modules for login, waiter, cashier, owner, kitchen, audit, reports, bills.
- [ ] Keep existing URLs and behavior stable during the split.

### Task 2: Create public feature surfaces

**Files:**
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\audit\index.ts`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\bills\index.ts`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\menu\index.ts`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\orders\index.ts`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\tables\index.ts`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\auth\index.ts`

- [ ] Export supported hooks, api helpers, and types intentionally.
- [ ] Stop importing other feature internals directly from route/page modules.
- [ ] Do not over-expose private helpers just to preserve old imports.

### Task 3: Replace `features/pos` aggregator

**Files:**
- Modify or Delete: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\pos\hooks\usePosData.ts`
- Review: all current imports of `usePosData.ts`

- [ ] Decide whether `pos` is a real domain feature or just a temporary aggregation bucket.
- [ ] Recommended: remove it as an aggregator and let pages compose hooks from each feature through public `index.ts` exports.
- [ ] If any shared query composition is still needed, move it into a route-specific hook under a `pages/` or `routes/` area, not a fake feature.

### Task 4: Split `App.tsx`

**Files:**
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\App.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\app\router.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\LoginPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\waiter\WaiterTablesPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\waiter\WaiterOrderPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\cashier\CashierTablesPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\cashier\CashierPaymentPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\shared\BillsListPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\shared\BillDetailPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\owner\OwnerDashboardPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\owner\AuditLogsPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\owner\KitchenPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\shared\ReportsPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\shared\ComingSoonPage.tsx`

- [ ] Move page-sized components out of `App.tsx` without changing logic first.
- [ ] Only after extraction, simplify imports and routing composition.
- [ ] Keep the first pass mechanical. Do not redesign UI in the same branch.

### Task 5: Normalize imports and conventions

**Files:**
- Modify: extracted pages and shared components touched in Task 4
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\components\ProtectedRoute.tsx`

- [ ] Convert relative app imports to `@/` where the convention requires it.
- [ ] Remove stale direct deep imports across features.
- [ ] Keep external-library imports unchanged unless formatting requires it.

### Task 6: Verify no behavior drift

**Files:**
- Verify: all web files changed in workstream 2

- [ ] Run `cmd.exe /c "cd apps\web && npm run build"`.
- [ ] Run `cmd.exe /c "cd apps\web && npm run lint"` if the current lint setup is stable.
- [ ] Smoke-test login, waiter open table, add item, send to kitchen, cashier payment, owner view bills, owner audit.

## Workstream 3: Print Agent Job Polling

### Task 1: Freeze the subsystem contract

**Files:**
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\restaurant_dotnet_docs\API_CONTRACT_V1.md`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\restaurant_dotnet_docs\MVP_SPEC.md`
- Review: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\restaurant_dotnet_docs\TECH_DECISIONS.md`
- Review: current print-agent files in `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\print-agent\Restaurant.PrintAgent\`

- [ ] Confirm the intended `print_jobs` lifecycle: pending, processing, completed, failed, or equivalent current model.
- [ ] Confirm how the agent authenticates to the API in Phase 1: API key header per docs.
- [ ] Confirm whether the API endpoints already exist. If not, this workstream must be split into API-first then agent-second.

### Task 2: Introduce internal boundaries in print-agent

**Files:**
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\print-agent\Restaurant.PrintAgent\Program.cs`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\print-agent\Restaurant.PrintAgent\Worker.cs`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\print-agent\Restaurant.PrintAgent\Services\IPrintJobClient.cs`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\print-agent\Restaurant.PrintAgent\Services\PrintJobClient.cs`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\print-agent\Restaurant.PrintAgent\Services\IPrinter.cs`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\print-agent\Restaurant.PrintAgent\Services\MockPrinter.cs`
- Optional Create later: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\print-agent\Restaurant.PrintAgent\Services\EscPosPrinter.cs`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\print-agent\Restaurant.PrintAgent\Models\PrintJobDto.cs`

- [ ] Separate concerns into polling client, print strategy, and worker orchestration.
- [ ] Keep mock mode as the default path first.
- [ ] Delay ESC/POS transport details until mock polling flow is verified end-to-end.

### Task 3: Implement polling state machine

**Files:**
- Modify: worker and new print services

- [ ] Poll pending jobs on interval.
- [ ] Claim or mark job as processing before printing if the API contract supports it.
- [ ] Execute mock printing by logging payload content deterministically.
- [ ] Report completed or failed status back to the API.
- [ ] Add idempotency guards so one bad loop does not re-print the same completed job.

### Task 4: Add configuration and resilience

**Files:**
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\print-agent\Restaurant.PrintAgent\appsettings.json`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\print-agent\Restaurant.PrintAgent\appsettings.Development.json`
- Optional Create: typed options classes under `Options\`

- [ ] Add API base URL, API key, polling interval, print mode, request timeout.
- [ ] Use typed options instead of raw string lookups where possible.
- [ ] Add basic retry/backoff for transient API failures.

### Task 5: Verify the subsystem

**Files:**
- Verify: print-agent and any API endpoint dependencies

- [ ] Run `cmd.exe /c "dotnet build apps\print-agent\Restaurant.PrintAgent\Restaurant.PrintAgent.csproj"`.
- [ ] Run the agent in mock mode against a local API.
- [ ] Create at least one test print job and confirm the status transitions through the backend.
- [ ] Confirm logs contain enough data for troubleshooting without leaking secrets.

## Recommended Branch Strategy

Use separate branches per workstream:
- `codex/refactor-tenant-context-hardening`
- `codex/refactor-web-app-boundary-split`
- `codex/feat-print-agent-job-polling`

Do not mix these into one branch unless the API contract for print-agent forces cross-app changes.

## Exit Criteria

Do not call the architecture stable again until all of the following are true:
- No business-write service uses `Guid.Empty` as a tenant or user fallback.
- `App.tsx` is small and only boots the app shell and routes.
- Each active web feature has a deliberate `index.ts` public surface.
- There is no fake cross-domain aggregator feature used only as a dependency shortcut.
- Print-agent performs the documented MVP print job flow in mock mode.
- API, web, and print-agent all still build successfully.
