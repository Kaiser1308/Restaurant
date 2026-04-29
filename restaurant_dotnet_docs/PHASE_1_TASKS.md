# Restaurant Phase 1 Tasks — Vertical Slice

## 1. Purpose

This file breaks Phase 1 into weekly vertical slices. Each week delivers a complete, testable feature flow from database to frontend.

Official stack:

```text
Frontend:
Vite React + TypeScript + TailwindCSS + TanStack Query + React Router

Backend:
ASP.NET Core Web API (.NET 9) + EF Core + PostgreSQL + FluentValidation + JWT Auth + Serilog

Realtime:
TanStack Query polling (primary) → SignalR (Week 5 if time permits)

Print Agent:
.NET Worker Service + polling print_jobs + ESC/POS TCP/LAN first + mock mode
```

Phase 1 goal:

> One real restaurant can run the core flow: waiter order → kitchen print → cashier payment → bill print → owner audit log.

Estimated duration: 5–6 weeks (35–42 days).

## 2. Phase 1 Rules

Do not build:

- Next.js
- Node backend
- Prisma
- Socket.io
- Redis
- SaaS billing
- Super admin
- Combo menu
- Discount system
- Advanced shift management
- Native mobile app
- Electron print agent

Build:

- Clean .NET backend (Controller → Service → Repository)
- EF Core schema with migrations
- TanStack Query polling for realtime (SignalR deferred to Week 5)
- .NET Worker print agent with mock mode
- Vite React frontend with feature-based architecture

## 3. Approach: Vertical Slice

Each week completes one end-to-end flow: DB → Backend API → Frontend UI → Manual Test.

```text
Week 1:  Foundation + Auth          → ✅ login works end-to-end
Week 2:  Tables + Menu + Ordering   → ✅ waiter can order and send to kitchen
Week 3:  Payment + Bills + Void     → ✅ cashier can pay, owner can void
Week 4:  Print + Audit + Reports    → ✅ full core flow with print agent
Week 5:  Polish + SignalR (optional)→ ✅ UX polish, tests, realtime upgrade
Week 6:  Pilot + Hardening         → ✅ running at real restaurant
```

Daily rhythm:

- Morning: DB migration + Backend API for today's feature.
- Afternoon: Frontend UI for the same feature.
- Evening: Manual end-to-end test of today's work.

---

## Week 1: Foundation + Auth (7 days)

Goal: project scaffold complete, login/logout works end-to-end, auth protected routes work.

### Day 1: Project Scaffold

Backend:

- Create ASP.NET Core Web API project (.NET 9).
- Create folder structure: Controllers, Services, Repositories, DTOs, Validators, Middleware, Domain/Entities, Domain/Enums, Infrastructure/Persistence, Infrastructure/Auth, Common/Result, Common/Exceptions.
- Add `/health` endpoint.
- Configure CORS for `http://localhost:5173`.
- Install and configure Serilog (Console + File sinks).
- Add global exception middleware with ProblemDetails response.
- Add Swagger/OpenAPI.

Frontend:

- Create Vite React TypeScript app.
- Install TailwindCSS, TanStack Query, React Router.
- Do NOT install Zustand or `@microsoft/signalr` yet.
- Create folder structure: app, components, features, hooks, layouts, pages, services, styles, types, utils.
- Add base routing with placeholder pages.

Database:

- Add Docker Compose PostgreSQL service.

Print Agent:

- Create .NET Worker Service project.
- Add basic worker loop that logs "Print agent running in Mock mode".
- Add config class: ApiBaseUrl, AgentKey, PollingIntervalSeconds, PrintMode.

Acceptance:

- API `/health` returns success.
- Web app runs at `http://localhost:5173`.
- Print agent runs and logs.
- PostgreSQL container starts.
- Serilog writes to console and `logs/` directory.

Commit: `chore: initialize Restaurant .NET stack foundation`

### Day 2: Base Component Library + Layouts

Frontend:

- Scaffold base components: Button, Input, Modal, Card, StatusBadge, EmptyState, LoadingSpinner, Toast.
- Create layouts: WaiterLayout (mobile, bottom nav), CashierLayout (desktop, sidebar), OwnerLayout (desktop, full sidebar).
- Setup API client service (axios instance with interceptors for JWT token).
- Create feature folder structure for: auth, tables, menu, orders, bills, audit, reports.

Backend:

- Add dependency injection configuration.
- Add Result<T> pattern for service responses.

Commit: `chore: scaffold base components, layouts, and project structure`

### Day 3: Auth Schema + Seed

Backend:

- Add EF Core packages (Npgsql, EFCore.NamingConventions).
- Create entities: Tenant, User, RefreshToken.
- Create `RestaurantDbContext` with enum string conversions.
- Create and apply initial migration.
- Add seed service: default tenant + default owner account (hashed password).
- Make seeding idempotent.

Acceptance:

- Migration runs. Tables exist in PostgreSQL.
- Default tenant and owner exist.
- Password is hashed.

Commit: `feat: add auth schema and seed default tenant/owner`

### Day 4: Login API

Backend:

- Add IAuthRepository, AuthRepository.
- Add AuthService: validate credentials, generate JWT (user id, tenant id, role), generate refresh token (hashed, stored in DB).
- Add AuthController: `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`.
- Add FluentValidation for login request.
- Add JWT authentication middleware.
- Add rate limiting on `/api/auth/login` (5 attempts/IP/minute).

Test with Swagger:

- Login with owner credentials → receive JWT + refresh token.
- Call `/auth/me` with Bearer token → receive user info.

Commit: `feat: implement JWT login with refresh token`

### Day 5: Login Frontend + Protected Routes

Frontend:

- Build LoginPage: username, password, submit, error display.
- Create auth feature: `features/auth/api/authApi.ts`, `features/auth/hooks/useAuth.ts`, `features/auth/hooks/useCurrentUser.ts`.
- Store JWT in localStorage. Attach via axios interceptor.
- Auto-refresh token when access token expires (axios response interceptor).
- Add ProtectedRoute wrapper: redirect to `/login` if no token.
- Add role-based navigation: show/hide menu items based on role.
- Add logout button.

Acceptance:

- Can login as owner → see dashboard.
- Unauthenticated access redirects to login.
- Logout clears token and redirects.

Commit: `feat: complete login flow end-to-end`

### Day 6: Role Authorization

Backend:

- Add authorization policies: OwnerOnly, OwnerOrManager, CashierOrAbove, WaiterOrAbove.
- Add PermissionService: `CanVoidBill(user)`, `CanManageMenu(user)`, `CanManageTables(user)`.
- Add tenant context middleware: extract tenant_id from JWT, make available to services.

Frontend:

- Add `useCurrentUser()` hook that reads from TanStack Query cache (`/auth/me`).
- Hide/show navigation items by role.

Commit: `feat: add role-based authorization`

### Day 7: Week 1 Review + Buffer

- Fix bugs from Day 1–6.
- Improve error handling and validation messages.
- Ensure login flow is stable.
- Add a second user account (waiter) via seed for testing.

Commit: `chore: stabilize auth flow`

**✅ Week 1 Checkpoint: login works. Protected routes work. Two users (owner, waiter) can login.**

---

## Week 2: Tables + Menu + Ordering (7 days)

Goal: waiter can select table, browse menu, create order, add items, cancel pending items, and send to kitchen.

### Day 8: Tables Schema + API + UI

Backend (DB + API):

- Add RestaurantTable entity. Migration.
- Add ITableRepository, TableRepository.
- Add TableService, TablesController.
- `GET /api/tables` — list all tables for tenant.
- `POST /api/tables` — create table (owner/manager only).
- `PATCH /api/tables/{id}` — update name/status.
- FluentValidation: unique name per tenant.

Frontend (same day):

- Build TableGrid component: cards showing table name + status badge.
- Click table → navigate to order page (or show "create order" if no active order).
- Add create table form (owner view).

Acceptance: tables display with status. Can create new table.

Commit: `feat: add tables API and UI`

### Day 9: Categories + Menu Items Schema + API

Backend:

- Add Category, MenuItem entities. Migration.
- Add ICategoryRepository, IMenuItemRepository.
- Add CategoryService, MenuItemService.
- `GET /api/categories` — list active categories.
- `POST /api/categories` — create (owner/manager).
- `GET /api/menu-items?categoryId=&search=` — list with filters.
- `POST /api/menu-items` — create (owner/manager).
- `PATCH /api/menu-items/{id}` — update.
- `PATCH /api/menu-items/{id}/availability` — toggle available.

Test with Swagger: create category "Drinks", create item "Phở Bò 50,000đ".

Commit: `feat: add categories and menu items API`

### Day 10: Menu UI + Management

Frontend:

- Build menu management page (owner/manager): create/edit categories, create/edit items, toggle availability.
- Build waiter menu view: category tabs, item cards with price, add button, disable unavailable, search input.
- Cache menu with TanStack Query `staleTime: 5 * 60 * 1000` (5 minutes) for network resilience.

Acceptance: owner can manage menu. Waiter can browse and search menu.

Commit: `feat: add menu management and waiter menu view`

### Day 11: Order Schema + Create Order API

Backend:

- Add Order, OrderItem entities. Migration.
- Add IOrderRepository, OrderRepository.
- Add OrderService.
- `POST /api/orders` — create order for table. Validate: one active order per table. Auto-set table to Occupied.
- `GET /api/orders/{id}` — order detail with items.
- `GET /api/tables/{tableId}/active-order` — get active order for table.

Frontend:

- Click table → if no active order, show "Create Order" → navigate to order page.
- Order page skeleton: header (table name), item list, total, action buttons.

Commit: `feat: implement order creation flow`

### Day 12: Add Items + Cancel Pending Items

Backend:

- `POST /api/orders/{id}/items` — add item. Validate: order is Pending or SentToKitchen. Snapshot item name and price.
- `PATCH /api/order-items/{itemId}` — update pending item quantity.
- `POST /api/order-items/{itemId}/cancel` — cancel pending item. Require reason. Write audit log.

Frontend:

- Add menu items to current order from waiter menu view.
- Show order item list with quantity controls.
- Cancel item: modal with required reason input.
- Disable editing for sent items (lock icon).

Acceptance: waiter can add items, change quantity, cancel with reason.

Commit: `feat: add items to orders and cancel pending items`

### Day 13: Send to Kitchen + Polling

Backend:

- `POST /api/orders/{id}/send-to-kitchen` — transaction: validate order has pending items, set order status to SentToKitchen (if not already), set only pending items to SentToKitchen, create audit log.
- Note: print job creation deferred to Week 4.

Frontend:

- "Send to Kitchen" button on order page.
- After send: lock sent items, show status badge.
- Add TanStack Query polling on active orders page: `refetchInterval: 2000`.
- Build basic kitchen display page: list of orders with items (polling every 2s).

Acceptance: waiter sends order → kitchen display updates within 2–3 seconds.

Commit: `feat: implement send-to-kitchen with polling`

### Day 14: Week 2 Review + Order Polish

- Fix bugs from Day 8–13.
- Test full flow: login as waiter → select table → add items → cancel one → send to kitchen.
- Improve loading states, error messages, empty states.
- Ensure table status changes correctly (Available → Occupied on order creation).

Commit: `chore: stabilize ordering flow`

**✅ Week 2 Checkpoint: demo to restaurant owner — waiter can browse menu, create order, add items, send to kitchen. Kitchen display shows incoming orders.**

---

## Week 3: Payment + Bills + Void (7 days)

Goal: cashier can pay orders, owner can void bills, bill snapshots work.

### Day 15: Bill Schema + Migration

Backend:

- Add Bill, BillItem, VoidLog, AuditLog, BillNumberSequence entities. Migration.
- Add IBillRepository, IVoidLogRepository, IAuditLogRepository.
- Configure indexes, decimal precision.

Commit: `feat: add bill, void, and audit log schema`

### Day 16: Pay Order API

Backend:

- Add BillService.
- `POST /api/orders/{id}/pay` — full transaction:
  1. Validate order has sent items and no existing bill.
  2. Generate BillNumber from BillNumberSequence (with `FOR UPDATE` lock).
  3. Create Bill (Paid status, payment type Cash/Qr).
  4. Create BillItem snapshots from non-cancelled order items.
  5. Set order status to Paid.
  6. Set table status to Available.
  7. Create AuditLog.

Test with Swagger: pay an order → verify bill created, items snapshotted, table freed.

Commit: `feat: implement pay order with bill snapshot`

### Day 17: Payment UI

Frontend:

- Build payment page: order summary, total, payment type selector (Cash/QR), confirm button.
- Cashier flow: from table grid → click occupied table → see order → click Pay → payment page.
- After payment: show success, redirect to table grid.
- Disable double-click on pay button.

Acceptance: cashier can pay order. Table returns to Available.

Commit: `feat: add cashier payment UI`

### Day 18: Bill Detail + Void Bill API

Backend:

- `GET /api/bills/{id}` — bill detail with items.
- `GET /api/bills?date=YYYY-MM-DD` — list bills by date.
- `POST /api/bills/{id}/void` — transaction:
  1. Validate bill status is Paid.
  2. Check PermissionService.CanVoidBill(user).
  3. Set bill status to Voided.
  4. Create VoidLog with reason.
  5. Create AuditLog.

Frontend:

- Bill detail page: bill number, items, total, status badge, payment type, paid at.
- Void button (owner only): modal with required reason.
- Bill list page: date filter, status filter.

Commit: `feat: add bill detail and void flow`

### Day 19: Audit Logs API + UI

Backend:

- `GET /api/audit-logs?from=&to=&action=&entityType=&userId=&page=&pageSize=` — paginated.
- Ensure all previous flows create audit logs: create_order, add_order_item, cancel_order_item, send_to_kitchen, pay_bill, void_bill.

Frontend:

- Audit logs page (owner): table with action, user, entity, timestamp, reason.
- Basic filters: date range, action type.

Commit: `feat: add audit log API and owner view`

### Day 20: Daily Report API + UI

Backend:

- `GET /api/reports/daily-revenue?date=YYYY-MM-DD` — total revenue, paid bill count, voided bill count, voided amount.

Frontend:

- Daily report page: 4 metric cards, bill list below.

Commit: `feat: add simple daily revenue report`

### Day 21: Week 3 Review

- Test full flow: order → pay → void → check audit log → check report.
- Fix bugs.
- Ensure bill snapshots are correct (price at time of payment, not current menu price).

Commit: `chore: stabilize payment and audit flow`

**✅ Week 3 Checkpoint: full core flow works end-to-end without printing. Cashier pays, owner voids, audit trail is complete.**

---

## Week 4: Print Agent + Integration (7 days)

Goal: print agent polls and processes print jobs. Full core flow with printing works.

### Day 22: Print Job Schema + API

Backend:

- Verify PrintJob entity exists from earlier migration, or add it now.
- Add IPrintJobRepository, PrintJobRepository.
- Add PrintJobService.
- `GET /api/print-jobs/pending?printerType=&limit=10` — for print agent (API key auth).
- `POST /api/print-jobs/{id}/mark-printing`.
- `POST /api/print-jobs/{id}/mark-printed`.
- `POST /api/print-jobs/{id}/mark-failed` (with errorMessage).

Commit: `feat: add print job polling endpoints`

### Day 23: Integrate Print Jobs into Order + Bill Flows

Backend:

- Update OrderService.SendToKitchenAsync: create kitchen PrintJob (type: Kitchen, content: order items JSON, unique print_key).
- Update BillService.PayOrderAsync: create cashier PrintJob (type: Cashier, content: bill JSON, unique print_key).
- Print jobs include item names, quantities, prices, table name, timestamps.

Commit: `feat: integrate print jobs into order and bill flows`

### Day 24: Print Agent — Mock Mode

Print Agent:

- Implement polling loop: call `GET /api/print-jobs/pending`, mark printing, log content to console, mark printed.
- Config: ApiBaseUrl, AgentKey, PollingIntervalSeconds, PrintMode (Mock/Real).
- In Mock mode: log formatted ticket to console and file instead of sending to printer.
- Handle errors: mark failed on exception, continue polling.

Acceptance: send order to kitchen → print agent picks up job → logs kitchen ticket → marks printed.

Commit: `feat: implement print agent mock mode`

### Day 25: Print Agent — ESC/POS TCP/LAN Prototype

Print Agent:

- Add ESC/POS TCP client: connect to IP:port, send raw bytes.
- Create kitchen ticket template: table name, items, quantities, timestamp.
- Create cashier bill template: bill number, items, prices, total, payment type, timestamp.
- Vietnamese text encoding handling.
- Keep mock mode as default. Real mode activated by config.

Commit: `feat: add ESC/POS TCP print prototype`

### Day 26: Print Status UI + Kitchen Cancel Print

Frontend:

- Show print status on bill detail (polling print job status).
- Show print status on order detail.

Backend:

- When order item is cancelled (after sent to kitchen), create kitchen_cancel PrintJob to notify kitchen.

Commit: `feat: add print status UI and kitchen cancel print`

### Day 27: End-to-End Integration Test

Manual full flow test:

1. Login owner → create table, category, menu item.
2. Login waiter → select table → add items → cancel one (with reason) → add another → send to kitchen.
3. Verify: print agent picks up kitchen ticket (mock log).
4. Login cashier → select table → pay order (Cash).
5. Verify: print agent picks up cashier bill (mock log).
6. Login owner → void bill (with reason).
7. Check audit logs → all actions recorded.
8. Check daily report → revenue and void amounts correct.

Fix any bugs found.

Commit: `test: verify full core flow with print agent`

### Day 28: Week 4 Buffer

- Fix remaining bugs.
- Improve print ticket formatting.
- Ensure print_key prevents duplicate prints.
- Add retry count tracking.

Commit: `chore: stabilize print agent integration`

**✅ Week 4 Checkpoint: COMPLETE core flow works. gọi món → in bếp → thanh toán → in bill → audit log. App is functional.**

---

## Week 5: Polish + Optional SignalR (7 days)

Goal: UX polish, automated tests, and optionally upgrade polling to SignalR.

### Day 29: Frontend UX Polish

Frontend:

- Loading states for all pages.
- Error toasts for failed mutations.
- Empty states (no tables, no orders, no bills).
- Disable double-click on all mutation buttons.
- Mobile spacing and touch targets for waiter layout.
- Number formatting for Vietnamese currency (50.000đ).

Commit: `chore: polish frontend UX states`

### Day 30: Backend Business Rule Tests

Add xUnit tests for:

- Cannot create duplicate active order for same table.
- Cannot edit sent item.
- Cancel requires reason.
- Pay creates bill item snapshots with correct amounts.
- Void requires permission (only owner).
- Print_key uniqueness prevents duplicate print jobs.
- BillNumber sequence increments correctly.
- Refresh token rotation works.

Commit: `test: add backend business rule tests`

### Day 31: API Integration Tests

Test complete flows via HTTP:

- Login → create table → create category → create menu item → create order → add item → cancel item → send to kitchen → pay order → void bill → fetch audit logs → fetch daily report.

Commit: `test: add API integration tests for core flow`

### Day 32–33: SignalR (Optional — skip if behind schedule)

If time permits:

Backend:

- Install SignalR.
- Create RestaurantHub at `/hubs/restaurant`.
- Authenticate hub connections with JWT.
- Group connections by tenant: `tenant:{tenantId}`.
- Broadcast events: OrderUpdated, TableUpdated, BillPaid, BillVoided, PrintJobUpdated.

Frontend:

- Install `@microsoft/signalr`.
- Create useSignalR hook with auto-reconnect.
- On SignalR event → invalidate relevant TanStack Query cache.
- Keep polling as fallback when SignalR disconnects.

If not enough time: polling works perfectly fine for Phase 1. SignalR can be added in Phase 2A.

Commit: `feat: add SignalR realtime (optional)`

### Day 34–35: Bug Fix Buffer + Menu Management Polish

- Fix all known bugs.
- Improve menu management UI: edit item, reorder categories.
- Add user management page for owner (create waiter/cashier accounts).
- Improve responsive layout on actual mobile device.

Commit: `fix: resolve pre-pilot issues`

**✅ Week 5 Checkpoint: app is polished, tested, and ready for pilot deployment.**

---

## Week 6: Pilot + Hardening (7 days)

Goal: deploy to real restaurant, run pilot shifts, fix real-world bugs.

### Day 36: Prepare Pilot Deployment

Tasks:

- Production config (appsettings.Production.json).
- Migration command documentation.
- Seed command documentation.
- Frontend production build.
- Print agent deployment instructions.
- Backup script (pg_dump cron job).

Commit: `chore: prepare pilot deployment package`

### Day 37: Printer Setup + Real Test

Collect/confirm from restaurant:

- Printer brand/model.
- LAN or USB.
- IP address and port.
- Paper width: 58mm or 80mm.
- ESC/POS compatibility.
- Vietnamese character support.

Test:

- Kitchen ticket on real printer.
- Cashier bill on real printer.
- Adjust formatting if needed.

Commit: `chore: validate real printer configuration`

### Day 38–39: Pilot Run

Tasks:

- Deploy at restaurant.
- Observe waiter flow during real service.
- Observe cashier flow.
- Monitor Serilog logs for errors.
- Monitor print agent logs.
- Record bugs and feedback from staff.
- Fix critical bugs immediately.

Commit: `chore: record pilot run feedback` / `fix: address critical pilot bugs`

### Day 40: User Guides

Docs:

- Waiter guide: how to select table, add items, cancel, send to kitchen.
- Cashier guide: how to pay, choose payment type.
- Owner guide: how to view audit logs, void bills, view reports.
- Print agent setup guide.
- Troubleshooting guide.

Commit: `docs: add pilot user and operator guides`

### Day 41: Final QA Checklist

Checklist:

- [ ] Login works for all 4 roles.
- [ ] Create/manage tables.
- [ ] Create/manage menu items.
- [ ] Create order, add items.
- [ ] Cancel pending item with reason.
- [ ] Send to kitchen (multiple rounds).
- [ ] Kitchen ticket prints (or mock logs).
- [ ] Pay order (Cash/QR).
- [ ] Cashier bill prints (or mock logs).
- [ ] Void bill with reason (owner only).
- [ ] Audit logs show all actions.
- [ ] Daily report shows correct amounts.
- [ ] No data disappears.
- [ ] Mobile layout works for waiter.

Commit: `test: complete MVP final QA checklist`

### Day 42: Release Candidate

Tasks:

- Update CHANGELOG.
- Tag release: `v1.0.0-rc1`.
- Backup database.
- Confirm deployment instructions are complete.

Commit: `chore: prepare Restaurant MVP release candidate`

---

## Final Acceptance Criteria

Phase 1 is complete when:

- Restaurant can run one real restaurant core flow.
- No hard delete exists for orders, order items, or bills.
- Cancel and void actions require reason.
- Bill snapshots preserve prices at payment time.
- Print jobs are tracked and idempotent (print_key).
- Print agent processes jobs in mock or real mode.
- Owner can inspect audit logs for all sensitive actions.
- System is stable enough for pilot use across multiple shifts.
