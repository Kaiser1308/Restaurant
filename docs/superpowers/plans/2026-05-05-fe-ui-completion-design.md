# FE UI Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the frontend UI surface so it exposes the MVP system capabilities already present in the backend and feels like a polished operational POS.

**Architecture:** Keep `App.tsx` as bootstrap only and keep routes in `apps/web/src/app/router.tsx`. Add reusable UI primitives in `apps/web/src/components/`, domain-specific blocks inside each feature or page folder, and expose feature APIs only through `features/*/index.ts`. Do not change API contracts, route shape, or backend behavior unless a task explicitly identifies a missing contract and stops for approval.

**Tech Stack:** React 19, TypeScript 6, Vite, TailwindCSS v4 CSS variables, TanStack Query, React Router, i18next.

---

## Current Gap Summary

Backend/controllers already expose UI-relevant capabilities for auth, tables, categories, menu items, orders, order items, bills, audit logs, reports, and print jobs. Current frontend has only basic primitives (`Button`, `Card`, `Input`, `Modal`, `StatusBadge`, `Toast`) and several page-level screens are still thin forms/lists. Missing UI surface includes management tables, edit flows, empty/error/loading states, print job monitoring, richer reports, consistent dialogs, responsive POS controls, and a real design-system layer.

## Files And Responsibilities

- Modify: `apps/web/src/index.css` for final POS design tokens, spacing utilities, responsive shell utilities, and component state classes.
- Modify: `apps/web/src/components/Button.tsx`, `Card.tsx`, `Input.tsx`, `Modal.tsx`, `StatusBadge.tsx`, `Toast.tsx`, `EmptyState.tsx`, `LoadingSpinner.tsx`.
- Create: `apps/web/src/components/PageHeader.tsx` for consistent page title, subtitle, actions, and metadata.
- Create: `apps/web/src/components/DataTable.tsx` for dense owner/cashier tables with empty/loading/error slots.
- Create: `apps/web/src/components/ConfirmDialog.tsx` for payment, void, cancel item, delete image, and sensitive actions.
- Create: `apps/web/src/components/Textarea.tsx`, `Select.tsx`, `SegmentedControl.tsx`, `StatCard.tsx`, `FormActions.tsx`, `FileUpload.tsx`, `QuantityStepper.tsx`.
- Modify: `apps/web/src/components/LanguageSwitcher.tsx` to match the updated design tokens.
- Modify: `apps/web/src/layouts/WaiterLayout.tsx`, `CashierLayout.tsx`, `OwnerLayout.tsx` for responsive navigation, active states, top-level status area, and mobile safety.
- Modify: `apps/web/src/pages/waiter/WaiterTablesPage.tsx`, `WaiterOrderPage.tsx`.
- Modify: `apps/web/src/pages/cashier/CashierTablesPage.tsx`, `CashierPaymentPage.tsx`.
- Modify: `apps/web/src/pages/owner/OwnerDashboardPage.tsx`, `KitchenPage.tsx`, `AuditLogsPage.tsx`.
- Modify: `apps/web/src/pages/shared/BillsListPage.tsx`, `BillDetailPage.tsx`, `ReportsPage.tsx`, `ComingSoonPage.tsx`.
- Create: `apps/web/src/pages/owner/TablesManagementPage.tsx` if existing `/owner/tables` coming-soon route is replaced after approval.
- Create: `apps/web/src/pages/owner/MenuManagementPage.tsx` if existing `/owner/menu` coming-soon route is replaced after approval.
- Create: `apps/web/src/pages/owner/PrintJobsPage.tsx` only after route approval, because it adds a visible route for `PrintJobsController`.
- Modify: `apps/web/src/features/menu/api/menuApi.ts`, `features/tables/api/tablesApi.ts`, `features/print-jobs/index.ts` only if current frontend API wrappers do not expose backend endpoints already implemented.
- Modify: both `apps/web/src/i18n/locales/vi/*.json` and `en/*.json` for every new visible UI string.

## Task 1: Component Foundation

**Files:**
- Create: `apps/web/src/components/PageHeader.tsx`
- Create: `apps/web/src/components/DataTable.tsx`
- Create: `apps/web/src/components/ConfirmDialog.tsx`
- Create: `apps/web/src/components/Textarea.tsx`
- Create: `apps/web/src/components/Select.tsx`
- Create: `apps/web/src/components/SegmentedControl.tsx`
- Create: `apps/web/src/components/StatCard.tsx`
- Create: `apps/web/src/components/FormActions.tsx`
- Create: `apps/web/src/components/FileUpload.tsx`
- Create: `apps/web/src/components/QuantityStepper.tsx`
- Modify: existing shared components for consistent tokens.

- [ ] Define component APIs with simple props and no new package dependencies.
- [ ] Make all controls keyboard focusable and ensure text does not overflow at mobile widths.
- [ ] Use CSS variables from `index.css`; avoid one-off color systems inside pages.
- [ ] Add Vietnamese and English labels for reusable empty/error/loading text.
- [ ] Run `cmd.exe /c "cd apps\\web && npm run build"`.
- [ ] Run `cmd.exe /c "cd apps\\web && npm run lint"`.

## Task 2: Layout And Navigation Completion

**Files:**
- Modify: `apps/web/src/layouts/WaiterLayout.tsx`
- Modify: `apps/web/src/layouts/CashierLayout.tsx`
- Modify: `apps/web/src/layouts/OwnerLayout.tsx`
- Modify: `apps/web/src/components/LanguageSwitcher.tsx`
- Modify: `apps/web/src/i18n/locales/{vi,en}/common.json`

- [ ] Add consistent role shell: brand, active nav, user role, language switcher, logout, and mobile bottom navigation where needed.
- [ ] Add page width rules so POS screens are dense on desktop and touch-friendly on mobile.
- [ ] Keep existing route definitions unchanged in this task.
- [ ] Verify `/login`, `/waiter/tables`, `/cashier/tables`, `/owner/dashboard` in browser.

## Task 3: Waiter Ordering UI

**Files:**
- Modify: `apps/web/src/pages/waiter/WaiterTablesPage.tsx`
- Modify: `apps/web/src/pages/waiter/WaiterOrderPage.tsx`
- Modify: `apps/web/src/i18n/locales/{vi,en}/tables.json`
- Modify: `apps/web/src/i18n/locales/{vi,en}/orders.json`
- Modify: `apps/web/src/i18n/locales/{vi,en}/menu.json`

- [ ] Add status-aware table cards with clear available, occupied, needs payment, and closed visual states.
- [ ] Add menu category rail, search, item availability state, and fast add buttons.
- [ ] Replace inline quantity controls with `QuantityStepper`.
- [ ] Replace cancel reason input area with `ConfirmDialog` + `Textarea`.
- [ ] Add empty states for no menu items, no categories, and empty order.
- [ ] Preserve current order mutation behavior and TanStack Query invalidation keys.
- [ ] Verify mobile viewport for waiter flow.

## Task 4: Cashier Payment UI

**Files:**
- Modify: `apps/web/src/pages/cashier/CashierTablesPage.tsx`
- Modify: `apps/web/src/pages/cashier/CashierPaymentPage.tsx`
- Modify: `apps/web/src/pages/shared/BillsListPage.tsx`
- Modify: `apps/web/src/pages/shared/BillDetailPage.tsx`
- Modify: `apps/web/src/i18n/locales/{vi,en}/bills.json`

- [ ] Add cashier table queue states: ready to pay, occupied, blocked, available.
- [ ] Add payment method segmented control for cash, QR, bank transfer.
- [ ] Add receipt-style bill preview with total, quantity, payment type, and confirm action.
- [ ] Use `ConfirmDialog` for payment confirmation.
- [ ] Add bill list filtering with dense rows and empty state.
- [ ] Add bill detail receipt layout and owner-only void section.

## Task 5: Owner Management UI

**Files:**
- Modify: `apps/web/src/pages/owner/OwnerDashboardPage.tsx`
- Create: `apps/web/src/pages/owner/TablesManagementPage.tsx` after route approval.
- Create: `apps/web/src/pages/owner/MenuManagementPage.tsx` after route approval.
- Modify: `apps/web/src/app/router.tsx` only after explicit route approval.
- Modify: `apps/web/src/i18n/locales/{vi,en}/tables.json`
- Modify: `apps/web/src/i18n/locales/{vi,en}/menu.json`

- [ ] Split owner dashboard into summary cards plus quick actions.
- [ ] Build full table management UI using `GET /api/tables`, `POST /api/tables`, and `PATCH /api/tables/{id}`.
- [ ] Build full menu/category management UI using category and menu item endpoints.
- [ ] Add image upload/delete UI using existing menu image endpoints.
- [ ] Stop before modifying routes if approval for replacing coming-soon pages has not been given.

## Task 6: Audit, Reports, And Print Jobs

**Files:**
- Modify: `apps/web/src/pages/owner/AuditLogsPage.tsx`
- Modify: `apps/web/src/pages/shared/ReportsPage.tsx`
- Create: `apps/web/src/features/print-jobs/api/printJobsApi.ts`
- Create: `apps/web/src/features/print-jobs/hooks/usePrintJobs.ts`
- Create: `apps/web/src/pages/owner/PrintJobsPage.tsx` after route approval.
- Modify: `apps/web/src/features/print-jobs/index.ts`
- Modify: `apps/web/src/i18n/locales/{vi,en}/audit.json`
- Modify: `apps/web/src/i18n/locales/{vi,en}/reports.json`
- Modify: `apps/web/src/i18n/locales/{vi,en}/common.json`

- [ ] Upgrade audit log page to a filterable `DataTable` with action, actor, entity, reason, and timestamp.
- [ ] Upgrade reports page to daily revenue cards using `GET /api/reports/daily-revenue`.
- [ ] Add print job API/hook wrappers for pending jobs if needed.
- [ ] Add owner print monitor page only after route approval.
- [ ] Include failed/printing/printed visual states and retry/operator guidance where backend supports it.

## Task 7: Visual QA And Hardening

**Files:**
- Modify only files touched by prior tasks.

- [ ] Run `cmd.exe /c "cd apps\\web && npm run build"`.
- [ ] Run `cmd.exe /c "cd apps\\web && npm run lint"`.
- [ ] Run `powershell -ExecutionPolicy Bypass -File scripts/verify-architecture.ps1`.
- [ ] Start web dev server with `cmd.exe /c "cd apps\\web && npm run dev"`.
- [ ] Browser-check `/login`, waiter table/order, cashier table/payment, owner dashboard/audit/reports.
- [ ] Check desktop width, mobile width, and text overflow for Vietnamese and English.
- [ ] Capture screenshots for the main flow before final signoff.

## Open Approvals Needed

1. Replacing `/owner/tables` coming-soon with a real management page changes visible route behavior.
2. Replacing `/owner/menu` coming-soon with a real management page changes visible route behavior.
3. Adding an owner print-jobs route exposes an existing backend capability in the web app.
4. Adding a frontend test runner would improve UI regression confidence but requires package/config approval.

## Verification Commands

```bash
cmd.exe /c "cd apps\\web && npm run build"
cmd.exe /c "cd apps\\web && npm run lint"
powershell -ExecutionPolicy Bypass -File scripts/verify-architecture.ps1
```

## Plan Self-Review

- Spec coverage: covers component foundation, role layouts, waiter, cashier, owner management, audit, reports, print jobs, i18n, and verification.
- Placeholder scan: no TBD/TODO placeholders.
- Scope check: route changes and new print-jobs route are explicitly gated for approval.
- Architecture consistency: public feature API remains through `features/*/index.ts`; no cross-feature deep imports are required.
