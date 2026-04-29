# Restaurant POS MVP Specification

## Product Summary

**Restaurant** is a POS system for small and medium dine-in restaurants. Phase 1 is a focused MVP for one real restaurant, not a full KiotViet replacement.

Core promise:

> Staff can operate fast, while the owner can still track money, orders, cancellations, voids, printed tickets, and printed bills.

Core principles:

- Fast table ordering.
- Kitchen ticket printing.
- Cashier bill printing.
- No hard delete for business records.
- Cancel and void actions require reasons.
- Owner can review audit logs.
- Print jobs are tracked and idempotent.
- `tenant_id` is required from the beginning.

## Target Users

- **Owner:** tracks revenue, paid bills, voided bills, cancelled items, staff actions, and whether any order/bill disappeared.
- **Manager:** handles daily operations, table/menu management, order monitoring, and staff support.
- **Cashier:** handles payment, bill printing, and payment accuracy.
- **Waiter:** handles table order taking, item changes while pending, sending to kitchen, and cancel reason entry.

## Restaurant Context

The first target restaurant has roughly 10–30 tables, one cashier station, one kitchen printer, one cashier bill printer, mobile web for waiters, and desktop web for cashier/owner/manager. Network may be unstable, so realtime must have polling fallback. Printer setup may vary, so mock print mode is required first.

## Main Pain Point

A manager or staff member may remove or void a bill/order too easily, creating risk of cash leakage.

Restaurant prevents this by design:

- Orders, order items, and bills do not disappear.
- Cancel/void actions leave visible records.
- Bills preserve item snapshots.
- Print jobs are traceable.
- Owners can review sensitive actions.

## MVP Goal

Within 5–6 weeks, deploy a working MVP for one restaurant supporting:

```text
waiter order → kitchen print → cashier payment → bill print → owner audit log
```

The MVP succeeds if one restaurant can use it for several real shifts without losing orders, bills, print jobs, or audit history.

## In-Scope Features

### System Foundation

- Monorepo structure.
- Vite React frontend.
- ASP.NET Core Web API backend (.NET 9).
- PostgreSQL database.
- Entity Framework Core migrations.
- .NET Worker Service print agent.
- Docker Compose for local PostgreSQL.
- Serilog structured logging.

### Auth and Roles

- Login/logout.
- JWT authentication.
- Roles: owner, manager, cashier, waiter.
- Basic role-based authorization.
- Seed one default tenant and one default owner account.

### Tenant Foundation

- `tenant_id` is required from the beginning.
- Phase 1 uses one seeded default tenant.
- All business tables include `tenant_id`.
- All backend queries filter by tenant context.

### Tables and Menu

- Restaurant table management.
- Table statuses: available, occupied, needs_payment, closed.
- Category management.
- Menu item management.
- Item availability toggle.

### Table Status Transitions

Table status changes are driven by order lifecycle:

- `Available → Occupied`: automatically when an order is created for the table.
- `Occupied → Occupied`: remains occupied while order is active (pending, sent to kitchen, items being added).
- `Occupied → NeedsPayment`: manually set by waiter/manager, or automatically when all items are served (future phase).
- `NeedsPayment → Available`: automatically when bill is paid and order is completed.
- `Available → Available`: if a paid bill is voided, table stays available (order is already closed). Owner must create a new order if correction is needed.
- `Closed`: table is temporarily out of service (maintenance, reserved). Only owner/manager can set this.
- `Closed → Available`: owner/manager manually reopens.

Rule: only one active (unpaid) order per table at any time.

### Orders

- Create order for table.
- Add item to order.
- Change pending item quantity.
- Cancel pending item with reason.
- Send order to kitchen.
- Lock sent items.
- Add new items to order that was already sent to kitchen.
- Prevent hard delete.

### Order Item States

MVP logic supports:

- pending
- sent_to_kitchen
- cancelled

Schema may include future states:

- cooking
- ready
- served

### Order State Machine Edge Cases

These edge cases must be handled correctly in MVP:

1. **Adding items after send to kitchen.** Waiter can add new items to an order that has already been sent to kitchen. New items start as `pending`. Waiter must "send to kitchen" again to submit the new items. Previously sent items remain locked. A new kitchen print job is created containing only the newly sent items.

2. **Cancelling all items.** If all items in a pending order are cancelled, the order status stays `Pending` with zero billable items. Waiter can still add new items. The order is not automatically deleted or closed.

3. **Mixed item states.** An order can have a mix of `sent_to_kitchen` and `pending` items at the same time. The "send to kitchen" action only processes items currently in `pending` state.

4. **Paying with cancelled items.** When paying, only non-cancelled items are included in the bill. Cancelled items remain visible in order history with their cancel reason but are excluded from the bill total.

5. **Multiple send-to-kitchen rounds.** Each "send to kitchen" action creates a separate kitchen print job. The print job content only includes items from that specific send round, not previously sent items.

### Bills and Payment

- Create bill from order.
- Payment type: cash or QR.
- Bill status: paid or voided.
- Bill item snapshots.
- Bill cannot be hard deleted.
- Paid bill cannot be edited directly.

### Bill Number Format

Bill numbers follow the format `{YYYYMMDD}-{SEQ:4}`.

Example: `20260429-0001`, `20260429-0002`.

Rules:

- Sequence is auto-incremented per tenant per day.
- Sequence resets to 0001 at the start of each calendar day.
- BillNumber is unique within a tenant.
- Generation must be concurrency-safe (use database sequence or row-level lock).

### Void Logs

- Void bill requires reason.
- Default permission: owner only.
- Permission implemented through helper/config, not hardcoded deep inside business logic.
- Void action creates both `void_logs` and `audit_logs`.

### Print Jobs

- `print_jobs` table.
- Unique `print_key`.
- Print types: kitchen, cashier, kitchen_cancel.
- Mock mode.
- Local .NET Worker Service polls print jobs.
- ESC/POS TCP/LAN first.

### Audit Logs

Must record: create_order, add_order_item, update_order_item, cancel_order_item, send_to_kitchen, create_bill, pay_bill, void_bill, create_print_job, update_print_job_status.

### Realtime

- TanStack Query polling every 2–3 seconds is the primary realtime strategy for Phase 1.
- SignalR is optional and deferred to Week 5 if time permits.
- Polling is reliable and sufficient for a single restaurant with 10–30 tables.
- Realtime must not block MVP delivery.

### Network Resilience

Restaurant WiFi can be unstable. MVP must handle:

- **Menu caching.** Frontend caches menu items using TanStack Query with a long `staleTime` (5 minutes). Waiters can still browse the menu when network is slow.
- **Mutation retry.** Critical mutations (send to kitchen, pay) show clear error messages on failure and allow manual retry. Do not auto-retry payment mutations.
- **Polling resilience.** TanStack Query continues polling attempts on failure with built-in retry logic.
- **Optimistic UI.** Adding items to a pending order can use optimistic updates for responsiveness. Roll back on server error.

### Simple Daily Report

- Total paid revenue by day.
- Number of paid bills.
- Number of voided bills.
- Total voided amount.

## Out of Scope for Phase 1

Do not build:

- Next.js frontend.
- Node.js backend.
- Prisma.
- Socket.io.
- Redis.
- SaaS billing.
- Super admin portal.
- Multi-tenant onboarding UI.
- Combo menu.
- Discount system.
- Advanced shift management.
- Customer loyalty.
- Native mobile app.
- Electron print agent.
- Advanced analytics.
- Inventory management.
- Accounting integration.
- Multi-branch support.
- Delivery integration.
- Advanced kitchen display system.

## Roles

### Owner

Can view all data, manage users/menu/tables, view audit logs, view daily reports, and void bills by default.

### Manager

Can manage tables/menu, monitor orders, support staff, and view basic reports if allowed. By default, manager cannot void paid bills unless permission is configured.

### Cashier

Can view active orders, process payment, print bill, and view bill details. Cannot void bills by default.

### Waiter

Can view table list, create order, add items, update pending items, cancel pending items with reason, and send order to kitchen. Cannot edit sent items.

## Core User Flows

### Login

User enters credentials. Backend validates credentials. Backend returns JWT access token. Frontend stores auth state. User sees role-specific navigation.

### Waiter Creates Order

Waiter selects table, creates order, adds items, sends order to kitchen, system locks sent items, creates kitchen print job, and broadcasts update through SignalR.

### Cancel Pending Item

Waiter selects pending item, enters reason, backend sets status to cancelled, records user/time/reason, writes audit log, and keeps item visible.

### Cashier Payment

Cashier opens active order, selects cash/QR, backend creates bill, copies order items into bill item snapshots, marks order as paid, creates cashier print job, and print agent prints bill.

### Void Bill

Owner opens bill detail, enters reason, backend checks permission, sets bill status to voided, creates void log and audit log, and keeps bill visible.

## Business Rules

- No hard delete for orders, order_items, bills, bill_items, void_logs, audit_logs, print_jobs.
- Pending item can be cancelled with reason.
- Sent item cannot be modified by waiter.
- Paid bill cannot be edited directly.
- Paid bill can only be voided by authorized role.
- Void requires reason.
- Print job requires unique `print_key`.
- Every business query must filter by tenant.
- Critical operations must use EF Core transactions.

## Data Principles

Required MVP tables:

- tenants
- users
- restaurant_tables
- categories
- menu_items
- orders
- order_items
- bills
- bill_items
- void_logs
- print_jobs
- audit_logs

Money values use `decimal` in C# and `numeric(18,2)` in PostgreSQL. IDs use `Guid` in C# and `uuid` in PostgreSQL. Bill snapshot is mandatory.

## Print Principles

Architecture:

```text
Web App
  → ASP.NET Core API
  → print_jobs table
  → .NET Worker Print Agent
  → ESC/POS printer over TCP/LAN
```

Week 1 must collect printer brand/model, LAN or USB, IP address if LAN, paper size, ESC/POS support, and Vietnamese text support.

## Audit and Log Principles

Audit logs must include tenant_id, user_id, action, entity_type, entity_id, old_value, new_value, reason if applicable, and created_at. Audit logs must not be edited or deleted from normal application flow.

## Success Criteria After 52 Days

The MVP succeeds if waiter can order, kitchen print job works or is mocked, cashier can pay by cash/QR, bill snapshots are created, owner can view audit logs, cancelled/voided records remain visible, no business record disappears, and the system can run for several real shifts without critical failure.

## Failure Criteria

The MVP fails if orders/bills can be hard deleted, paid bills can be edited directly, cancel/void actions have no reason, audit log is unreliable, print jobs duplicate frequently, print jobs disappear without status, or staff cannot complete order/payment flow during service.

## Future Phases

- **Phase 2A:** stabilize, fix pilot bugs, improve print reliability, reprint with reason, backup, better audit filters, end-of-day report.
- **Phase 2B:** build only requested features such as combo, shift, table merge/split, discount, notifications, cancel approval if needed.
- **Phase 3:** multi-tenant onboarding, tenant isolation, printer config per tenant, cloud deploy, basic super admin.
- **Phase 4:** SaaS plans, billing, trial flow, support tools, monitoring, landing page, scaling.
