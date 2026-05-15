# Web App Boundary Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Break the current frontend app out of the `App.tsx` god file and restore clear routing, page, and feature boundaries without changing URLs or user-facing behavior.

**Architecture:** Execute this as a mechanical decomposition first, not a redesign. Extract page-sized components and routing into `app/` and `pages/`, add deliberate public `index.ts` surfaces for feature modules, then remove the fake cross-domain `features/pos` aggregator by shifting composition into page/route code.

**Tech Stack:** React 19, TypeScript, React Router, TanStack Query, Vite, i18next.

---

## File Structure

**Create**
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\app\router.tsx`
  Responsibility: define top-level route tree and compose layouts/pages.
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\LoginPage.tsx`
  Responsibility: login screen only.
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\HomeRedirect.tsx`
  Responsibility: role-based post-login redirect.
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\waiter\WaiterTablesPage.tsx`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\waiter\WaiterOrderPage.tsx`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\cashier\CashierTablesPage.tsx`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\cashier\CashierPaymentPage.tsx`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\owner\OwnerDashboardPage.tsx`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\owner\KitchenPage.tsx`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\owner\AuditLogsPage.tsx`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\shared\BillsListPage.tsx`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\shared\BillDetailPage.tsx`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\shared\ReportsPage.tsx`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\shared\ComingSoonPage.tsx`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\audit\index.ts`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\bills\index.ts`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\menu\index.ts`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\orders\index.ts`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\tables\index.ts`

**Modify**
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\App.tsx`
  Responsibility after refactor: providers + router mount only.
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\main.tsx`
  Responsibility: keep bootstrap intact, only import App.
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\components\ProtectedRoute.tsx`
  Responsibility: route guard only, normalize imports if touched.
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\auth\index.ts`
  Responsibility: preserve/clean existing auth public surface.
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\pos\hooks\usePosData.ts`
  Responsibility: remove or retire fake cross-domain aggregator after callers move.

**Verify**
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\layouts\WaiterLayout.tsx`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\layouts\CashierLayout.tsx`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\layouts\OwnerLayout.tsx`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\services\api.ts`

---

### Task 1: Freeze feature public surfaces

**Files:**
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\auth\index.ts`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\audit\index.ts`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\bills\index.ts`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\menu\index.ts`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\orders\index.ts`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\tables\index.ts`

- [ ] **Step 1: Define minimal exports for each feature**

Recommended exports:
- `auth`: keep current hooks/api/types public surface, but route/page code should consume from `@/features/auth`
- `tables`: export `tablesApi`
- `orders`: export `ordersApi`
- `menu`: export `menuApi`
- `bills`: export `billsApi`
- `audit`: export `auditApi`

Example for `tables/index.ts`:

```ts
export { tablesApi } from './api/tablesApi'
```

Example for `orders/index.ts`:

```ts
export { ordersApi } from './api/ordersApi'
```

- [ ] **Step 2: Keep exports intentionally narrow**

Do not export internal helpers “just in case”. Only expose what pages/router need today.

- [ ] **Step 3: Run build**

Run: `cmd.exe /c "cd apps\web && npm run build"`
Expected: may fail due to remaining imports not yet migrated, but index files themselves should be syntactically valid.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/auth/index.ts apps/web/src/features/audit/index.ts apps/web/src/features/bills/index.ts apps/web/src/features/menu/index.ts apps/web/src/features/orders/index.ts apps/web/src/features/tables/index.ts
git commit -m "refactor: add public web feature surfaces"
```

### Task 2: Extract top-level routing into `app/router.tsx`

**Files:**
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\app\router.tsx`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\App.tsx`

- [ ] **Step 1: Move route tree shape out of `App.tsx`**

`router.tsx` should own:
- `/login`
- `/`
- `/waiter/*`
- `/cashier/*`
- `/owner/*`
- `*`

`App.tsx` should only keep:

```tsx
<QueryClientProvider client={queryClient}>
  <BrowserRouter>
    <AppRouter />
  </BrowserRouter>
</QueryClientProvider>
```

- [ ] **Step 2: Keep route URLs unchanged**

Do not change any path strings during extraction.

- [ ] **Step 3: Keep nested layout composition unchanged for now**

The first pass is mechanical extraction. Do not flatten or redesign route nesting yet.

- [ ] **Step 4: Run build**

Run: `cmd.exe /c "cd apps\web && npm run build"`
Expected: may still fail until page extractions are complete, but router/App wiring should typecheck locally as far as possible.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/router.tsx apps/web/src/App.tsx
git commit -m "refactor: extract top-level web router"
```

### Task 3: Extract auth/shared route entry pages

**Files:**
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\LoginPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\HomeRedirect.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\shared\ReportsPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\shared\ComingSoonPage.tsx`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\app\router.tsx`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\App.tsx`

- [ ] **Step 1: Move `LoginPage` and `HomeRedirect` out of `App.tsx` without changing logic**
- [ ] **Step 2: Move `ReportsPage` and `ComingSoonPage` out of `App.tsx` without changing logic**
- [ ] **Step 3: Update imports to use feature public surfaces and `@/` aliases where applicable**
- [ ] **Step 4: Run build**

Run: `cmd.exe /c "cd apps\web && npm run build"`
Expected: may still fail until remaining page extractions are complete.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/pages/LoginPage.tsx apps/web/src/pages/HomeRedirect.tsx apps/web/src/pages/shared/ReportsPage.tsx apps/web/src/pages/shared/ComingSoonPage.tsx apps/web/src/app/router.tsx apps/web/src/App.tsx
git commit -m "refactor: extract shared route entry pages"
```

### Task 4: Extract waiter pages

**Files:**
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\waiter\WaiterTablesPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\waiter\WaiterOrderPage.tsx`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\app\router.tsx`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\App.tsx`

- [ ] **Step 1: Move waiter table flow unchanged**

Keep current logic:
- `useTables`
- `useCreateOrder`
- `tablesApi.getActiveOrder`
- navigation to `/waiter/orders/:orderId`

- [ ] **Step 2: Move waiter order flow unchanged**

Keep current logic:
- `useOrderDetail`
- `useCategories`
- `useMenuItems`
- add/update/cancel/send mutations
- current i18n and format helper usage

- [ ] **Step 3: Replace direct feature deep imports with page-level imports via public feature surfaces where possible**

- [ ] **Step 4: Run build**

Run: `cmd.exe /c "cd apps\web && npm run build"`
Expected: may still fail until cashier/owner pages move, but waiter extraction should typecheck.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/pages/waiter/WaiterTablesPage.tsx apps/web/src/pages/waiter/WaiterOrderPage.tsx apps/web/src/app/router.tsx apps/web/src/App.tsx
git commit -m "refactor: extract waiter pages"
```

### Task 5: Extract cashier and shared bill pages

**Files:**
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\cashier\CashierTablesPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\cashier\CashierPaymentPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\shared\BillsListPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\shared\BillDetailPage.tsx`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\app\router.tsx`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\App.tsx`

- [ ] **Step 1: Move cashier table and payment flows unchanged**
- [ ] **Step 2: Move shared bills list/detail pages unchanged**
- [ ] **Step 3: Keep route params and `basePath` behavior intact**
- [ ] **Step 4: Run build**

Run: `cmd.exe /c "cd apps\web && npm run build"`
Expected: may still fail until owner pages move, but cashier/shared extraction should typecheck.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/pages/cashier/CashierTablesPage.tsx apps/web/src/pages/cashier/CashierPaymentPage.tsx apps/web/src/pages/shared/BillsListPage.tsx apps/web/src/pages/shared/BillDetailPage.tsx apps/web/src/app/router.tsx apps/web/src/App.tsx
git commit -m "refactor: extract cashier and bill pages"
```

### Task 6: Extract owner pages

**Files:**
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\owner\OwnerDashboardPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\owner\KitchenPage.tsx`
- Create: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\pages\owner\AuditLogsPage.tsx`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\app\router.tsx`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\App.tsx`

- [ ] **Step 1: Move owner dashboard unchanged, including table/category/menu creation flows and image upload flow**
- [ ] **Step 2: Move kitchen and audit pages unchanged**
- [ ] **Step 3: Keep current route/layout placement and translation usage intact**
- [ ] **Step 4: Run build**

Run: `cmd.exe /c "cd apps\web && npm run build"`
Expected: `Build succeeded.`

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/pages/owner/OwnerDashboardPage.tsx apps/web/src/pages/owner/KitchenPage.tsx apps/web/src/pages/owner/AuditLogsPage.tsx apps/web/src/app/router.tsx apps/web/src/App.tsx
git commit -m "refactor: extract owner pages"
```

### Task 7: Retire `features/pos` aggregator

**Files:**
- Modify or Delete: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\features\pos\hooks\usePosData.ts`
- Modify: any page imports still using `features/pos`

- [ ] **Step 1: Replace all page imports from `features/pos/hooks/usePosData.ts`**

Pages should import needed hooks or APIs directly from the relevant feature public surfaces or keep local page-level query logic.

- [ ] **Step 2: Decide the end state**

Recommended end state:
- delete `usePosData.ts` if no longer used
- do not replace it with another cross-domain feature hub

- [ ] **Step 3: Run build**

Run: `cmd.exe /c "cd apps\web && npm run build"`
Expected: `Build succeeded.`

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/pos/hooks/usePosData.ts apps/web/src/pages apps/web/src/app/router.tsx apps/web/src/App.tsx
git commit -m "refactor: remove web pos aggregator"
```

### Task 8: Normalize route guard imports and final frontend verification

**Files:**
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\web\src\components\ProtectedRoute.tsx`
- Verify: all files touched in Tasks 1-7

- [ ] **Step 1: Normalize app-local imports to `@/` where practical**

At minimum, clean up:
- `ProtectedRoute.tsx`
- newly extracted pages
- route modules

Do not do repo-wide import churn outside touched files.

- [ ] **Step 2: Rebuild frontend**

Run: `cmd.exe /c "cd apps\web && npm run build"`
Expected: `vite build` succeeds.

- [ ] **Step 3: Run lint if current lint config is stable**

Run: `cmd.exe /c "cd apps\web && npm run lint"`
Expected: pass, or report exact lint failures if current repo baseline is not clean.

- [ ] **Step 4: Smoke-test core flows manually**

Minimum smoke list:
- login
- waiter open table
- waiter add item
- waiter send to kitchen
- cashier payment
- owner bills list/detail
- owner dashboard create table/category/menu item
- owner audit page

- [ ] **Step 5: Confirm `App.tsx` is reduced to bootstrap only**

Success target:
- `App.tsx` no longer contains page-sized components or business workflow code
- route/page composition lives in `app/router.tsx` and `pages/`

## Self-Review

Spec coverage:
- feature public API surfaces: Task 1
- routing extraction: Task 2
- page extraction by domain: Tasks 3-6
- fake aggregator removal: Task 7
- import normalization + verification: Task 8

Placeholder scan:
- no TBD/TODO markers
- exact file paths included
- exact verification commands included

Type consistency:
- new route module named `AppRouter`
- extracted page filenames match component names
- use existing feature/API names, do not invent parallel abstractions

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-01-web-app-boundary-split.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
