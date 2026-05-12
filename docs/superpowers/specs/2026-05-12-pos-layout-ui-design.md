# Restaurant POS Layout and UI Design

## Purpose

Define the visual direction, role-based layout rules, color system, and implementation scope for the Restaurant POS web app. This spec is for the current Vite React frontend and must support fast table service, cashier payment, owner audit/reports, Vietnamese-first i18n, and long-shift readability.

The UI should feel like an operational restaurant tool: calm, fast, readable, and trustworthy. It should not feel like a marketing site, decorative dashboard, or experimental dark interface.

## Reference Review

The local references in `awesome-design-md/design-md/` were reviewed and mixed selectively.

- Notion is the primary base: warm neutral background, white surfaces, soft borders, restrained blue accent, and approachable product UI.
- Stripe contributes payment-grade polish: deep navy text, conservative radius, blue-tinted focus/elevation, and tabular number treatment for money.
- Airtable contributes data density: clean enterprise table/list styling, clear borders, and information-heavy layouts.
- Wise contributes a small payment/success accent: fresh green for positive money outcomes, used sparingly.

Rejected as a primary base:

- Linear and Sentry are dark-first. They are useful for developer tools but would make waiter/cashier shifts harder to read.
- Cal is too monochrome for a state-heavy POS where table/order/payment status must be recognizable at a glance.
- PostHog is too playful and editorial for cash-control, audit, and payment workflows.

## Design Principles

1. Operational clarity first. Status, total amount, table name, and primary action must be visually dominant.
2. Warm neutral chrome. The frame should stay calm so business state colors can carry meaning.
3. State colors are semantic, not decorative. Green, amber, blue, red, and gray map to specific POS meanings.
4. Role layouts differ by workflow. Waiter is mobile-first; cashier and owner are desktop-first.
5. Dense but not cramped. Tables, bills, audit logs, and reports should support scanning and repeated use.
6. i18n-safe text. Components must tolerate longer English/Vietnamese labels without overlap.
7. No new UI framework. Keep TailwindCSS v4 and the existing component layer.

## Final Palette

Core tokens:

| Token | Value | Role |
| --- | --- | --- |
| `--color-primary` | `#0B6FBD` | Main action, active nav, links |
| `--color-primary-active` | `#075A99` | Pressed/hover primary action |
| `--color-primary-soft` | `#EAF4FC` | Active nav background, info tint |
| `--color-page` | `#F7F6F3` | App background, warm Notion-like canvas |
| `--color-surface` | `#FFFFFF` | Cards, panels, sidebar, modal |
| `--color-surface-muted` | `#EFEDEA` | Subtle bands, disabled fills |
| `--color-surface-raised` | `#FBFAF8` | Hoverable tile/card fill |
| `--color-text` | `#172026` | Primary text, deep navy/near-black |
| `--color-text-muted` | `#5F6B70` | Secondary labels and metadata |
| `--color-border` | `#D8DEDF` | Standard borders |
| `--color-border-subtle` | `rgba(23, 32, 38, 0.10)` | Whisper border |

Semantic tokens:

| Token | Value | POS meaning |
| --- | --- | --- |
| `--color-success` | `#168A4A` | Available, paid, completed |
| `--color-success-soft` | `#E7F6EE` | Success badge/tile background |
| `--color-warning` | `#C77700` | Occupied, needs attention, waiting |
| `--color-warning-soft` | `#FFF4DE` | Warning badge/tile background |
| `--color-danger` | `#B42318` | Cancelled, voided, destructive action |
| `--color-danger-soft` | `#FDEBE9` | Danger badge/tile background |
| `--color-info` | `#2563EB` | Sent to kitchen, processing, print progress |
| `--color-info-soft` | `#EAF0FF` | Info badge/tile background |
| `--color-neutral` | `#6B7280` | Closed, inactive, secondary state |
| `--color-neutral-soft` | `#F1F2F4` | Neutral badge/tile background |
| `--color-payment` | `#74C947` | Payment confirmation accent only |

Usage constraints:

- Primary blue is for navigation, primary actions, focus, links, and selected controls.
- Payment green is only for successful payment confirmation or paid totals, not general buttons.
- Destructive actions always use red and require confirmation where business rules require a reason.
- Avoid large saturated backgrounds. Use color mostly in badges, left rails, icons, thin accents, and buttons.

## Typography

Keep the current `Be Vietnam Pro` because it supports Vietnamese well and already matches the app. Use a restrained scale:

| Role | Size | Weight | Notes |
| --- | --- | --- | --- |
| Page title | `24-32px` | `800` | Do not use hero-scale type inside the app |
| Section title | `18-22px` | `700-800` | Cards, panels, page regions |
| Body | `14-16px` | `400-500` | Forms, descriptions, table cells |
| UI label | `12-14px` | `600-700` | Buttons, badges, nav |
| Money/metrics | `20-30px` | `800` | Use tabular numerals where possible |

Rules:

- Letter spacing remains `0` for normal UI text.
- Use compact headings in dashboards and panels; reserve larger text for table names, totals, and page headings.
- Long Vietnamese and English labels must wrap or truncate intentionally, never overlap.

## Shape, Border, and Depth

Use conservative operational shapes:

- Buttons and inputs: `4-6px` radius.
- Table/order/payment tiles: `8px` radius.
- Cards/panels: `8px` radius unless an existing component already requires otherwise.
- Modals: `10-12px` radius.
- Badges: pill radius is allowed because badges are small repeated status elements.

Depth:

- Default cards use a 1px border and very soft shadow.
- Interactive tiles can lift slightly on hover, but should not shift layout.
- Modals and dropdowns may use deeper multi-layer shadow.
- Do not nest cards inside cards. Use full-width sections or internal bordered rows instead.

## Role-Based Layout

### Waiter

Waiter screens are mobile-first and optimized for thumb use.

- Header stays compact: brand, staff name/role, language switcher, logout.
- Bottom nav is the primary mobile navigation.
- Table map uses large touch targets with status color accents and table names as the strongest text.
- Order page should prioritize active order and primary action. Menu browsing is secondary but quickly reachable.
- On narrow screens, keep the current order total and send-to-kitchen action visible after the item list when the user is editing the order. If sticky positioning causes overlap with the bottom nav, use a non-sticky summary block directly above the final action area.
- Pending items need visible quantity controls and cancel action; sent items are visually locked.

### Cashier

Cashier screens are desktop-first and optimized for payment accuracy.

- Sidebar remains fixed on desktop with table map, bills, and quick reports.
- Main area should favor high-density lists and a clear payment panel.
- Payment screens should separate:
  - bill/order details,
  - amount/tender/payment method,
  - print/pay actions,
  - risk actions like void.
- Paid/voided status must be visually unambiguous.
- Money values should be right-aligned in lists and use tabular numerals.

### Owner and Manager

Owner screens are desktop-first and optimized for control, audit, and review.

- Sidebar can hold the full navigation set.
- Dashboard should show operational stats first, then quick actions.
- Audit logs, reports, bills, and print jobs should use dense table layouts with filters.
- Sensitive actions and void/cancel history must remain visible, not hidden behind decorative summaries.
- Mobile owner layout can be usable, but desktop is the primary target.

## Component Direction

Shared components should become the source of visual consistency:

- `Button`: primary, secondary, ghost, danger, and payment/success variants. Icons can be added later where useful.
- `Card`: reduce radius to operational scale and support bordered/flat variants.
- `StatusBadge`: map every table/order/item/bill/print status to semantic tokens.
- `StatCard`: compact metrics, no oversized marketing cards.
- `PageHeader`: consistent title, subtitle, and right-side actions.
- `DataTable`: dense rows, optional sticky header only for long owner/cashier lists, numeric alignment, empty/loading/error states.
- `Input`, `Select`, `Textarea`: consistent focus ring, border, disabled state, error text.
- `ConfirmDialog`: strong destructive styling and reason input support.
- `Toast`: semantic background/border with concise copy.

## Page-Level Application

Priority screens for the first implementation pass:

1. Login page: calm brand entry, no decorative hero, clear language switching.
2. Waiter tables: improved table tiles, status accents, mobile spacing.
3. Waiter order: two-pane desktop, mobile-first order/menu flow, clearer locked/pending states.
4. Cashier tables and payment: payment-oriented layout, money hierarchy, paid/needs-payment clarity.
5. Owner dashboard: compact stats and operational shortcuts.
6. Audit logs/reports/print jobs: table density and filter consistency.

## Implementation Scope

Allowed scope for the implementation plan:

- Modify global tokens and base utility classes in `apps/web/src/index.css`.
- Modify shared UI components under `apps/web/src/components/`.
- Modify role layouts under `apps/web/src/layouts/`.
- Modify page composition/styling under `apps/web/src/pages/`.
- Add or update i18n keys only when visible UI text changes.

Out of scope:

- New routes.
- Backend/API contract changes.
- New global state library.
- New UI framework.
- SignalR or realtime behavior changes.
- Business rule changes.

## Planned Files

Likely modified files:

- `apps/web/src/index.css`
- `apps/web/src/components/Button.tsx`
- `apps/web/src/components/Card.tsx`
- `apps/web/src/components/StatusBadge.tsx`
- `apps/web/src/components/StatCard.tsx`
- `apps/web/src/components/PageHeader.tsx`
- `apps/web/src/components/DataTable.tsx`
- `apps/web/src/components/Input.tsx`
- `apps/web/src/components/Select.tsx`
- `apps/web/src/components/Textarea.tsx`
- `apps/web/src/components/ConfirmDialog.tsx`
- `apps/web/src/components/Toast.tsx`
- `apps/web/src/layouts/WaiterLayout.tsx`
- `apps/web/src/layouts/CashierLayout.tsx`
- `apps/web/src/layouts/OwnerLayout.tsx`
- `apps/web/src/pages/LoginPage.tsx`
- `apps/web/src/pages/waiter/WaiterTablesPage.tsx`
- `apps/web/src/pages/waiter/WaiterOrderPage.tsx`
- `apps/web/src/pages/cashier/CashierTablesPage.tsx`
- `apps/web/src/pages/cashier/CashierPaymentPage.tsx`
- `apps/web/src/pages/owner/OwnerDashboardPage.tsx`
- `apps/web/src/pages/owner/AuditLogsPage.tsx`
- `apps/web/src/pages/shared/BillsListPage.tsx`
- `apps/web/src/pages/shared/BillDetailPage.tsx`
- `apps/web/src/pages/shared/ReportsPage.tsx`
- `apps/web/src/pages/owner/PrintJobsPage.tsx`

The implementation plan may narrow this list after code review.

## Verification

Before claiming implementation complete, run:

```bash
powershell -ExecutionPolicy Bypass -File scripts/verify-architecture.ps1
cmd.exe /c "cd apps\web && npm run build"
cmd.exe /c "cd apps\web && npm run lint"
```

If frontend visual changes are implemented, also start the web dev server and inspect the main role screens in browser at desktop and mobile widths.

## Risks and Mitigations

- Risk: Too many color accents create noisy POS screens. Mitigation: keep saturated color limited to semantic badges, primary actions, and thin accents.
- Risk: Existing dirty worktree contains unrelated UI changes. Mitigation: implementation plan must inspect current diffs and avoid reverting user work.
- Risk: Long i18n labels break buttons/nav. Mitigation: use stable dimensions, wrapping/truncation rules, and verify Vietnamese/English screens.
- Risk: Card-heavy dashboard becomes decorative. Mitigation: use cards for repeated items and metrics only; avoid nested cards and marketing layout.

## Acceptance Criteria

- The selected design direction is documented and traceable to local reference files.
- The color system supports table, order, bill, print, and audit states without ambiguity.
- Role layouts match the real POS workflows for waiter, cashier, and owner/manager.
- Implementation scope does not require backend/API/route changes.
- Verification commands are defined before implementation starts.
