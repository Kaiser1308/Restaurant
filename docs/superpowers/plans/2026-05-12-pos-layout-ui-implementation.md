# POS Layout UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved operational POS visual system from `docs/superpowers/specs/2026-05-12-pos-layout-ui-design.md` to the React web app without changing routes, APIs, or business behavior.

**Architecture:** Centralize design decisions in `apps/web/src/index.css` and shared components first, then update role layouts and page compositions to consume the shared tokens. Keep the app's existing feature/page architecture and TailwindCSS v4 setup.

**Tech Stack:** Vite, React 19, TypeScript, TailwindCSS v4, React Router, TanStack Query, react-i18next.

---

## Scope Guardrails

- Do not change backend code, API contracts, routes, auth behavior, data fetching behavior, or business rules.
- Do not install a UI framework, icon package, Zustand, SignalR, or new runtime dependency.
- Do not deep-import feature internals beyond existing page patterns.
- Preserve all current i18n namespace rules: use `useTranslation('namespace')` and call `t('key')`, or use explicit namespace prefixes only when already using multiple namespaces.
- Work with the dirty worktree. Do not revert unrelated changes.

## File Map

Global visual foundation:

- Modify `apps/web/src/index.css`: design tokens, shadows, base page classes, table tile classes, nav classes, focus treatment.

Shared components:

- Modify `apps/web/src/components/Button.tsx`: add `success`/`payment` variant, update token names, preserve existing props.
- Modify `apps/web/src/components/Card.tsx`: add optional `variant` and `padding` props while preserving default usage.
- Modify `apps/web/src/components/StatusBadge.tsx`: move hard-coded colors to semantic token classes.
- Modify `apps/web/src/components/StatCard.tsx`: use semantic token classes and compact operational metrics.
- Modify `apps/web/src/components/DataTable.tsx`: update dense table styling, header, row hover, numeric alignment via column `className`.
- Modify `apps/web/src/components/PageHeader.tsx`: ensure wrapping actions and no text overlap.
- Modify `apps/web/src/components/Input.tsx`, `Select.tsx`, `Textarea.tsx`: consistent focus, border, disabled, and error surface.
- Modify `apps/web/src/components/ConfirmDialog.tsx`: destructive action visual hierarchy.
- Modify `apps/web/src/components/Toast.tsx`: semantic toast surfaces.

Role layouts:

- Modify `apps/web/src/layouts/WaiterLayout.tsx`: compact mobile-first shell.
- Modify `apps/web/src/layouts/CashierLayout.tsx`: payment-oriented desktop shell.
- Modify `apps/web/src/layouts/OwnerLayout.tsx`: dense management shell.

Priority pages:

- Modify `apps/web/src/pages/LoginPage.tsx`.
- Modify `apps/web/src/pages/waiter/WaiterTablesPage.tsx`.
- Modify `apps/web/src/pages/waiter/WaiterOrderPage.tsx`.
- Modify `apps/web/src/pages/cashier/CashierTablesPage.tsx`.
- Modify `apps/web/src/pages/cashier/CashierPaymentPage.tsx`.
- Modify `apps/web/src/pages/owner/OwnerDashboardPage.tsx`.
- Modify `apps/web/src/pages/owner/AuditLogsPage.tsx`.
- Modify `apps/web/src/pages/shared/BillsListPage.tsx`.
- Modify `apps/web/src/pages/shared/BillDetailPage.tsx`.
- Modify `apps/web/src/pages/shared/ReportsPage.tsx`.
- Modify `apps/web/src/pages/owner/PrintJobsPage.tsx`.

Verification:

- Run architecture verification.
- Run frontend build and lint through `cmd.exe /c`.
- Start web dev server and visually inspect waiter, cashier, and owner screens at desktop and mobile widths.

---

## Task 1: Global Design Tokens and Base Classes

**Files:**
- Modify: `apps/web/src/index.css`

- [ ] **Step 1: Snapshot current token usage**

Run:

```bash
rtk rg -n "color-(primary|surface|on-surface|outline|error|warning|success|info)|radius-card|shadow-card|table-tile|nav-link|soft-panel" apps/web/src
```

Expected: command lists current CSS variable consumers so token renames can be handled by compatibility aliases instead of a breaking rename.

- [ ] **Step 2: Update root tokens while preserving compatibility aliases**

In `apps/web/src/index.css`, replace the current `:root` block with this token set:

```css
:root {
  --color-primary: #0b6fbd;
  --color-primary-active: #075a99;
  --color-primary-soft: #eaf4fc;
  --color-page: #f7f6f3;
  --color-surface: #ffffff;
  --color-surface-muted: #efedea;
  --color-surface-raised: #fbfaf8;
  --color-text: #172026;
  --color-text-muted: #5f6b70;
  --color-border: #d8dedf;
  --color-border-subtle: rgba(23, 32, 38, 0.1);
  --color-success: #168a4a;
  --color-success-soft: #e7f6ee;
  --color-warning: #c77700;
  --color-warning-soft: #fff4de;
  --color-danger: #b42318;
  --color-danger-soft: #fdebe9;
  --color-info: #2563eb;
  --color-info-soft: #eaf0ff;
  --color-neutral: #6b7280;
  --color-neutral-soft: #f1f2f4;
  --color-payment: #74c947;

  --color-surface-low: var(--color-page);
  --color-surface-high: var(--color-surface-muted);
  --color-surface-white: var(--color-surface);
  --color-on-surface: var(--color-text);
  --color-on-surface-variant: var(--color-text-muted);
  --color-outline: #9aa6aa;
  --color-outline-variant: var(--color-border-subtle);
  --color-secondary: #2f383d;
  --color-secondary-container: rgba(23, 32, 38, 0.06);
  --color-error: var(--color-danger);

  --radius-sm: 5px;
  --radius-button: 5px;
  --radius-card: 8px;
  --radius-panel: 10px;
  --shadow-card: rgba(23, 32, 38, 0.04) 0px 4px 16px, rgba(23, 32, 38, 0.03) 0px 1px 3px;
  --shadow-deep: rgba(23, 32, 38, 0.08) 0px 18px 42px, rgba(23, 32, 38, 0.06) 0px 6px 18px;
  --shadow-focus: 0 0 0 3px rgba(11, 111, 189, 0.18);
}
```

- [ ] **Step 3: Update base body and utility classes**

In `apps/web/src/index.css`, ensure the existing base classes use the new tokens:

```css
body {
  margin: 0;
  min-height: 100vh;
  font-family: "Be Vietnam Pro", sans-serif;
  background: var(--color-page);
  color: var(--color-text);
  letter-spacing: 0;
}

.app-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

.page-title {
  font-size: clamp(1.5rem, 1.8vw, 2rem);
  line-height: 1.12;
  font-weight: 800;
  color: var(--color-text);
}

.page-subtitle {
  margin-top: 6px;
  max-width: 720px;
  color: var(--color-text-muted);
  font-size: 0.93rem;
  font-weight: 500;
}

.soft-panel {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}
```

- [ ] **Step 4: Update reusable tile and nav classes**

In `apps/web/src/index.css`, update the existing `.table-tile` and `.nav-link` blocks:

```css
.table-tile {
  min-height: 132px;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, background 140ms ease;
}

.table-tile:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(11, 111, 189, 0.28);
  background: var(--color-surface-raised);
  box-shadow: var(--shadow-deep);
}

.table-tile:disabled {
  cursor: not-allowed;
  opacity: 0.58;
  box-shadow: none;
}

.nav-link {
  border-radius: 6px;
  padding: 10px 12px;
  color: var(--color-text);
  font-size: 0.92rem;
  font-weight: 700;
  transition: background 140ms ease, color 140ms ease;
}

.nav-link:hover,
.nav-link.active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
```

- [ ] **Step 5: Run CSS token smoke check**

Run:

```bash
cmd.exe /c "cd apps\web && npm run build"
```

Expected: build may still fail only if existing unrelated TypeScript errors are present. If failure references unknown CSS variables or modified UI files, fix before continuing.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/index.css
git commit -m "style: add pos design tokens"
```

---

## Task 2: Shared Component Visual System

**Files:**
- Modify: `apps/web/src/components/Button.tsx`
- Modify: `apps/web/src/components/Card.tsx`
- Modify: `apps/web/src/components/StatusBadge.tsx`
- Modify: `apps/web/src/components/StatCard.tsx`
- Modify: `apps/web/src/components/DataTable.tsx`
- Modify: `apps/web/src/components/PageHeader.tsx`
- Modify: `apps/web/src/components/Input.tsx`
- Modify: `apps/web/src/components/Select.tsx`
- Modify: `apps/web/src/components/Textarea.tsx`
- Modify: `apps/web/src/components/ConfirmDialog.tsx`
- Modify: `apps/web/src/components/Toast.tsx`

- [ ] **Step 1: Update Button variants**

In `apps/web/src/components/Button.tsx`, extend the variant type and replace the `variants` map:

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-page)] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-[0.98]'

const variants = {
  primary: 'border border-transparent bg-[var(--color-primary)] text-white shadow-[var(--shadow-card)] hover:bg-[var(--color-primary-active)]',
  secondary: 'border border-[var(--color-border-subtle)] bg-[var(--color-secondary-container)] text-[var(--color-text)] hover:bg-[rgba(23,32,38,0.09)]',
  danger: 'border border-transparent bg-[var(--color-danger)] text-white hover:brightness-95',
  ghost: 'border border-transparent bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]',
  success: 'border border-transparent bg-[var(--color-payment)] text-[#163300] hover:brightness-95',
}
```

Keep the existing `sizes` shape, with radius still using `--radius-button`.

- [ ] **Step 2: Update Card to support variants without breaking callers**

Replace `apps/web/src/components/Card.tsx` with:

```tsx
type CardVariant = 'default' | 'flat' | 'muted'
type CardPadding = 'none' | 'sm' | 'md'

export default function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
}: {
  children: React.ReactNode
  className?: string
  variant?: CardVariant
  padding?: CardPadding
}) {
  const variants: Record<CardVariant, string> = {
    default: 'border border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]',
    flat: 'border border-[var(--color-border-subtle)] bg-[var(--color-surface)]',
    muted: 'border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)]',
  }
  const paddings: Record<CardPadding, string> = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
  }

  return (
    <div className={`rounded-[var(--radius-card)] ${variants[variant]} ${paddings[padding]} ${className}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Replace StatusBadge hard-coded colors with semantic tokens**

In `apps/web/src/components/StatusBadge.tsx`, keep `statusKeyMap` and replace `palette` with:

```tsx
const palette: Record<string, string> = {
  available: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border-[rgba(22,138,74,0.28)]',
  occupied: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[rgba(199,119,0,0.32)]',
  needspayment: 'bg-[var(--color-info-soft)] text-[var(--color-info)] border-[rgba(37,99,235,0.28)]',
  reserved: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[rgba(199,119,0,0.32)]',
  closed: 'bg-[var(--color-neutral-soft)] text-[var(--color-neutral)] border-[rgba(107,114,128,0.28)]',
  attention: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[rgba(180,35,24,0.28)]',
  paid: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border-[rgba(22,138,74,0.28)]',
  voided: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[rgba(180,35,24,0.28)]',
  cancelled: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[rgba(180,35,24,0.28)]',
  pending: 'bg-[var(--color-neutral-soft)] text-[var(--color-neutral)] border-[rgba(107,114,128,0.28)]',
  senttokitchen: 'bg-[var(--color-info-soft)] text-[var(--color-info)] border-[rgba(37,99,235,0.28)]',
  printing: 'bg-[var(--color-info-soft)] text-[var(--color-info)] border-[rgba(37,99,235,0.28)]',
  printed: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border-[rgba(22,138,74,0.28)]',
  failed: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[rgba(180,35,24,0.28)]',
}
```

Also use this fallback:

```tsx
const style = palette[normalized] ?? 'bg-[var(--color-neutral-soft)] text-[var(--color-neutral)] border-[rgba(107,114,128,0.28)]'
```

- [ ] **Step 4: Update StatCard tone classes**

In `apps/web/src/components/StatCard.tsx`, replace `tones` and the wrapper classes:

```tsx
const tones = {
  neutral: 'border-[var(--color-border-subtle)]',
  info: 'border-[rgba(37,99,235,0.28)] bg-[var(--color-info-soft)]',
  success: 'border-[rgba(22,138,74,0.28)] bg-[var(--color-success-soft)]',
  warning: 'border-[rgba(199,119,0,0.32)] bg-[var(--color-warning-soft)]',
  danger: 'border-[rgba(180,35,24,0.28)] bg-[var(--color-danger-soft)]',
}

return (
  <div className={`rounded-[var(--radius-card)] border bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] ${tones[tone]}`}>
    <p className="text-xs font-bold uppercase text-[var(--color-text-muted)]">{label}</p>
    <div className="mt-2 text-2xl font-extrabold leading-tight tabular-nums text-[var(--color-text)]">{value}</div>
  </div>
)
```

- [ ] **Step 5: Update DataTable for dense operational lists**

In `apps/web/src/components/DataTable.tsx`, update the table section:

```tsx
return (
  <div className="soft-panel overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-[var(--color-surface-muted)] text-xs font-bold uppercase text-[var(--color-text-muted)]">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`border-b border-[var(--color-border-subtle)] px-4 py-3 ${column.className ?? ''}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border-subtle)] bg-[var(--color-surface)]">
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="align-top transition-colors hover:bg-[var(--color-surface-raised)]">
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3 ${column.className ?? ''}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)
```

- [ ] **Step 6: Update form components and feedback components**

For `Input.tsx`, `Select.tsx`, and `Textarea.tsx`, replace old color tokens with:

```tsx
border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[rgba(11,111,189,0.18)]
```

For `ConfirmDialog.tsx`, keep the API and ensure the action row remains:

```tsx
<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
```

For `Toast.tsx`, map variants to semantic soft backgrounds and text tokens.

- [ ] **Step 7: Build after shared components**

Run:

```bash
cmd.exe /c "cd apps\web && npm run build"
```

Expected: TypeScript accepts the new `success` variant and updated component props.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/components
git commit -m "style: align shared ui components"
```

---

## Task 3: Role Layout Shells

**Files:**
- Modify: `apps/web/src/layouts/WaiterLayout.tsx`
- Modify: `apps/web/src/layouts/CashierLayout.tsx`
- Modify: `apps/web/src/layouts/OwnerLayout.tsx`

- [ ] **Step 1: Update layout colors to new tokens**

In all three layout files, replace visual token references consistently:

```tsx
bg-[var(--color-surface-low)] -> bg-[var(--color-page)]
bg-[var(--color-surface-white)] -> bg-[var(--color-surface)]
border-[var(--color-outline-variant)] -> border-[var(--color-border-subtle)]
text-[var(--color-on-surface)] -> text-[var(--color-text)]
text-[var(--color-on-surface-variant)] -> text-[var(--color-text-muted)]
```

- [ ] **Step 2: Waiter layout mobile shell**

Keep the existing structure, but ensure:

```tsx
<main className="mx-auto w-full max-w-5xl p-3 pb-5 md:p-6">{children}</main>
```

and bottom nav links keep `min-h-[44px]` for touch targets.

- [ ] **Step 3: Cashier and Owner desktop shells**

For desktop sidebars, use:

```tsx
<aside className="hidden w-64 flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-surface)] md:flex">
```

Owner remains `w-72`. Main content remains:

```tsx
<main className="flex-1 p-4 pt-20 md:p-6">{children}</main>
```

- [ ] **Step 4: Build layout pass**

Run:

```bash
cmd.exe /c "cd apps\web && npm run build"
```

Expected: no route/layout TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/layouts
git commit -m "style: refine role layout shells"
```

---

## Task 4: Waiter Screens

**Files:**
- Modify: `apps/web/src/pages/waiter/WaiterTablesPage.tsx`
- Modify: `apps/web/src/pages/waiter/WaiterOrderPage.tsx`

- [ ] **Step 1: Update WaiterTablesPage table tiles**

In `WaiterTablesPage.tsx`, keep the data flow and `openTable` function unchanged. Replace the table tile body with:

```tsx
<button key={table.id} className="table-tile p-4 text-left" onClick={() => openTable(table)}>
  <div className="flex h-full flex-col justify-between gap-4">
    <div className="min-w-0">
      <p className="truncate text-xl font-extrabold tabular-nums text-[var(--color-text)]">{table.name}</p>
      <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{t('waiter.openHint')}</p>
    </div>
    <div className="flex items-center justify-between gap-2">
      <StatusBadge status={table.status} />
      <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
    </div>
  </div>
</button>
```

- [ ] **Step 2: Update WaiterOrderPage item rows**

In `WaiterOrderPage.tsx`, keep mutations unchanged. For each order item wrapper, use:

```tsx
<div key={item.id} className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-3">
```

For totals, use:

```tsx
<p className="text-2xl font-extrabold tabular-nums text-[var(--color-text)]">{formatMoney(order.totalAmount)}</p>
```

- [ ] **Step 3: Update menu item rows**

In the menu item map, use:

```tsx
<div key={item.id} className="grid grid-cols-[88px_1fr] gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-3 sm:grid-cols-[96px_1fr]">
```

Keep image handling unchanged.

- [ ] **Step 4: Build waiter pass**

Run:

```bash
cmd.exe /c "cd apps\web && npm run build"
```

Expected: no TypeScript errors from waiter pages.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/pages/waiter
git commit -m "style: optimize waiter pos screens"
```

---

## Task 5: Cashier Screens

**Files:**
- Modify: `apps/web/src/pages/cashier/CashierTablesPage.tsx`
- Modify: `apps/web/src/pages/cashier/CashierPaymentPage.tsx`
- Modify: `apps/web/src/pages/shared/BillsListPage.tsx`
- Modify: `apps/web/src/pages/shared/BillDetailPage.tsx`

- [ ] **Step 1: Inspect cashier pages before editing**

Run:

```bash
rtk rg -n "formatMoney|StatusBadge|DataTable|Card|Button|NeedsPayment|Paid|Void|void" apps/web/src/pages/cashier apps/web/src/pages/shared
```

Expected: identify all payment and bill status display points.

- [ ] **Step 2: Update CashierPaymentPage hierarchy**

In `CashierPaymentPage.tsx`, keep data and mutation logic unchanged. Update the payment card total:

```tsx
<p className="mt-1 text-4xl font-extrabold leading-tight tabular-nums text-[var(--color-text)]">{formatMoney(preview.totalAmount)}</p>
```

Change the payment button to:

```tsx
<Button className="w-full" variant="success" disabled={payOrder.isPending} onClick={() => setConfirmOpen(true)}>
  {t('actions.confirmPayment')}
</Button>
```

- [ ] **Step 3: Update bill line rows**

In `CashierPaymentPage.tsx` and `BillDetailPage.tsx`, use this row style for bill/order item lines:

```tsx
className="flex justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-3"
```

Money text should include:

```tsx
className="font-bold tabular-nums text-[var(--color-text)]"
```

- [ ] **Step 4: Update bill list density**

In `BillsListPage.tsx`, ensure money and bill numbers use `tabular-nums`, and DataTable column classes use right alignment for amounts:

```tsx
className: 'text-right tabular-nums'
```

- [ ] **Step 5: Build cashier pass**

Run:

```bash
cmd.exe /c "cd apps\web && npm run build"
```

Expected: no TypeScript errors from the new `success` button variant or table class changes.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/pages/cashier apps/web/src/pages/shared/BillsListPage.tsx apps/web/src/pages/shared/BillDetailPage.tsx
git commit -m "style: clarify cashier payment screens"
```

---

## Task 6: Owner, Reports, Audit, and Print Job Screens

**Files:**
- Modify: `apps/web/src/pages/owner/OwnerDashboardPage.tsx`
- Modify: `apps/web/src/pages/owner/AuditLogsPage.tsx`
- Modify: `apps/web/src/pages/shared/ReportsPage.tsx`
- Modify: `apps/web/src/pages/owner/PrintJobsPage.tsx`

- [ ] **Step 1: Update dashboard metric emphasis**

In `OwnerDashboardPage.tsx`, keep existing query logic unchanged. Ensure quick action card uses `Card variant="flat"` if it contains only buttons:

```tsx
<Card variant="flat">
```

Use `StatCard` tones as already present.

- [ ] **Step 2: Update AuditLogsPage table/list styling**

If `AuditLogsPage.tsx` uses `DataTable`, align timestamp columns with:

```tsx
className: 'whitespace-nowrap tabular-nums'
```

If it uses custom rows, update row containers to:

```tsx
className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3"
```

- [ ] **Step 3: Update ReportsPage financial values**

In `ReportsPage.tsx`, any revenue/void/paid amount display should use:

```tsx
className="tabular-nums"
```

and StatCard tone mapping:

```tsx
tone="success" // paid revenue
tone="danger" // voided amount
tone="info" // bill count
```

- [ ] **Step 4: Update PrintJobsPage status presentation**

Use `StatusBadge` for print status and ensure print job identifiers use:

```tsx
className="font-mono text-xs text-[var(--color-text-muted)]"
```

- [ ] **Step 5: Build owner pass**

Run:

```bash
cmd.exe /c "cd apps\web && npm run build"
```

Expected: no TypeScript errors in owner/shared pages.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/pages/owner apps/web/src/pages/shared/ReportsPage.tsx
git commit -m "style: improve owner operations screens"
```

---

## Task 7: Login Page and i18n Safety Pass

**Files:**
- Modify: `apps/web/src/pages/LoginPage.tsx`
- Modify only if visible text changes: `apps/web/src/i18n/locales/vi/*.json`
- Modify only if visible text changes: `apps/web/src/i18n/locales/en/*.json`

- [ ] **Step 1: Keep login operational, not marketing**

In `LoginPage.tsx`, keep login behavior unchanged. Use a centered operational panel with tokens:

```tsx
className="min-h-screen bg-[var(--color-page)] px-4 py-8"
```

Login form container should use:

```tsx
className="mx-auto w-full max-w-md rounded-[var(--radius-panel)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
```

- [ ] **Step 2: Check visible text changes**

Run:

```bash
rtk git diff -- apps/web/src/pages/LoginPage.tsx apps/web/src/i18n/locales
```

Expected: if new visible text was added, both Vietnamese and English locale files are updated in the correct namespace.

- [ ] **Step 3: Build login/i18n pass**

Run:

```bash
cmd.exe /c "cd apps\web && npm run build"
```

Expected: no i18n import or TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/LoginPage.tsx apps/web/src/i18n/locales
git commit -m "style: refine login screen"
```

---

## Task 8: Full Verification and Browser Review

**Files:**
- No planned source edits unless verification finds a regression.

- [ ] **Step 1: Run architecture verification**

Run:

```bash
powershell -ExecutionPolicy Bypass -File scripts/verify-architecture.ps1
```

Expected: `Architecture verification passed.`

- [ ] **Step 2: Run frontend build**

Run:

```bash
cmd.exe /c "cd apps\web && npm run build"
```

Expected: build exits 0.

- [ ] **Step 3: Run frontend lint**

Run:

```bash
cmd.exe /c "cd apps\web && npm run lint"
```

Expected: lint exits 0, or only reports pre-existing unrelated warnings that are documented in the final handoff.

- [ ] **Step 4: Start web dev server**

Run:

```bash
cmd.exe /c "cd apps\web && npm run dev"
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 5: Browser review checklist**

Open the app and inspect:

- `/login` at mobile and desktop widths.
- waiter table map and order page at mobile width.
- cashier table/payment screens at desktop width.
- owner dashboard, audit logs, reports, and print jobs at desktop width.

Required checks:

- Text does not overlap buttons, cards, nav, or status badges.
- Primary and destructive actions are visually distinct.
- Money values are readable and aligned where listed.
- Status badges use semantic colors consistently.
- Mobile bottom nav does not cover final action areas.
- No nested-card look on dashboard or page sections.

- [ ] **Step 6: Final commit if verification fixes were needed**

If any verification-only fixes were made:

```bash
git add apps/web/src
git commit -m "fix: polish pos ui verification issues"
```

If no fixes were needed, do not create an empty commit.

---

## Final Handoff Requirements

When implementation is complete, report:

- Changed files.
- Build result.
- Lint result.
- Architecture verification result.
- Browser review notes, including viewports inspected.
- Any pre-existing dirty worktree entries intentionally left untouched.
