# Restaurant Technical Decisions

## Final Tech Stack

### Frontend

- Vite React
- TypeScript
- TailwindCSS
- React Router
- TanStack Query
- Zustand
- `@microsoft/signalr`

### Backend

- ASP.NET Core Web API (.NET 9)
- Entity Framework Core
- PostgreSQL
- FluentValidation
- JWT Auth
- SignalR
- Serilog

### Print Agent

- .NET Worker Service
- Polling `print_jobs` from backend API
- ESC/POS TCP/LAN first
- Mock mode

### Local Development

- Docker Compose for PostgreSQL.
- .NET CLI.
- Node.js for frontend tooling.
- Environment variables through `.env` / `appsettings.Development.json`.

## Decisions We Are Not Taking

The project will not use these in Phase 1:

- Next.js for the POS app.
- Node.js backend.
- Express backend.
- Prisma ORM.
- Socket.io.
- Node.js print agent.
- Redis.
- Electron print agent.
- Native mobile app.

## Why Vite React

Restaurant POS is a client-heavy internal app. It needs table map, order entry, cashier payment screen, owner audit screen, realtime updates, and mobile web for waiters. It does not need SEO or SSR.

Vite React is selected because it is fast, low overhead, simple to deploy, and avoids Next.js App Router complexity. Next.js can be used later for a marketing website, not the POS app.

## Why TypeScript

TypeScript reduces runtime mistakes when UI consumes backend DTOs. It helps with API response typing, role-based UI conditions, order state handling, bill/payment data, and SignalR event payloads.

## Why TailwindCSS

TailwindCSS helps build UI fast for mobile waiter screens, cashier layouts, table cards, status badges, modals, and management screens.

Risk: class names can become messy.

Mitigation: create base components such as Button, Input, Modal, Card, StatusBadge, TableCard, and OrderItemRow.

## Why TanStack Query

TanStack Query manages server state: tables, categories, menu items, orders, bills, audit logs, and print job status.

It provides caching, loading states, error states, mutation handling, invalidation, and polling fallback.

Rule:

> TanStack Query handles server state. Zustand handles client/UI state.

## Why Zustand (Optional)

Zustand is optional in Phase 1. TanStack Query handles server state (the majority of data). Most client state can be handled with simpler alternatives:

- Auth state: TanStack Query `useQuery` for `/auth/me` + `localStorage` for JWT token.
- Selected table: React Router URL params (`/orders/:tableId`).
- Modal/UI state: `useState` or `useReducer` inside components.

If a cross-feature global state need arises that cannot be solved with the above, add Zustand at that point. It is lightweight and can be introduced incrementally without refactoring.

Rule: Do not install Zustand on Day 1. Start without it. Add it only when you hit a real need.

## Why ASP.NET Core Web API

Restaurant POS is a business-critical backend. It needs transaction safety, clear controllers/services, strong typing, validation, authorization, realtime support, background-service compatibility, and long-term maintainability.

ASP.NET Core fits transactional flows such as sending order to kitchen, paying bill, creating bill snapshots, creating print jobs, creating audit logs, and voiding bills.

## Why .NET 9

.NET 9 is selected because it is the latest stable release (November 2025), offers improved performance over .NET 8, and provides long-term support. It has native SignalR support, Worker Service support for the print agent, and strong PostgreSQL tooling through Npgsql.

## Backend Architecture

Clean Architecture Light — three layers, no over-engineering:

```text
apps/api/
  Restaurant.Api/
    Controllers/         → Thin. Receive request, call service, return response.
    Services/            → Business logic, transaction orchestration, audit logging.
    Repositories/        → EF Core queries, data access. Injected into services.
    DTOs/                → Request/Response data transfer objects.
    Validators/          → FluentValidation request validators.
    Middleware/           → Exception handling, tenant context, rate limiting.
    Hubs/                → SignalR hub (added in Week 5).
    Domain/
      Entities/          → EF Core entity classes.
      Enums/             → OrderStatus, BillStatus, etc.
    Infrastructure/
      Persistence/       → DbContext, EF configurations, migrations.
      Auth/              → JWT generation, password hashing.
    Common/
      Result/            → Result<T> pattern for service responses.
      Exceptions/        → Custom exception types.
```

### Layer Rules

- **Controllers** must not contain business logic. They call a service method and return the result.
- **Services** contain all business logic, use transactions for critical flows, and call repositories for data access.
- **Repositories** encapsulate EF Core queries. Each entity group has a repository interface + implementation. Services depend on interfaces, not concrete repositories.
- In Phase 1, repositories can be simple (thin wrappers around DbContext). They exist primarily to make services testable via mocking.

### Why Repository Layer

Without repositories, services depend directly on `DbContext`. This makes unit testing painful because you need an in-memory database or test container for every test.

With repositories:

```csharp
// Service depends on interface — easy to mock in tests
public class OrderService
{
    private readonly IOrderRepository _orderRepo;
    private readonly IAuditLogRepository _auditRepo;
    
    public async Task SendToKitchenAsync(Guid orderId) { ... }
}

// Repository interface
public interface IOrderRepository
{
    Task<Order?> GetByIdWithItemsAsync(Guid id);
    Task UpdateAsync(Order order);
}
```

Rule: Do not create a generic `IRepository<T>`. Each entity group gets its own specific repository with meaningful method names.

## Frontend Architecture

### Folder Structure

Feature-based architecture. Each feature owns its own API calls, components, hooks, and types:

```text
apps/web/src/
├── app/                    # App config: router, providers, query client
├── assets/                 # Static assets: logo, icons
├── components/             # Shared UI components (design system)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Card.tsx
│   ├── StatusBadge.tsx
│   ├── EmptyState.tsx
│   ├── LoadingSpinner.tsx
│   └── Toast.tsx
├── features/               # Feature modules
│   ├── auth/
│   │   ├── api/            # login, refresh, me
│   │   ├── components/     # LoginForm
│   │   ├── hooks/          # useAuth, useCurrentUser
│   │   ├── types/
│   │   └── index.ts
│   ├── tables/
│   │   ├── api/
│   │   ├── components/     # TableCard, TableGrid
│   │   ├── hooks/          # useTables, useTableStatus
│   │   ├── types/
│   │   └── index.ts
│   ├── menu/
│   │   ├── api/
│   │   ├── components/     # MenuItemCard, CategoryTabs
│   │   ├── hooks/
│   │   ├── types/
│   │   └── index.ts
│   ├── orders/
│   │   ├── api/
│   │   ├── components/     # OrderItemRow, OrderSummary, KitchenView
│   │   ├── hooks/          # useOrder, useOrderItems, useKitchenOrders
│   │   ├── types/
│   │   └── index.ts
│   ├── bills/
│   │   ├── api/
│   │   ├── components/     # PaymentForm, BillDetail, BillReceipt
│   │   ├── hooks/
│   │   ├── types/
│   │   └── index.ts
│   ├── audit/
│   └── reports/
├── hooks/                  # Shared hooks: usePollingFallback, useDebounce
├── layouts/                # Page layouts
│   ├── WaiterLayout.tsx    # Mobile-optimized, bottom nav
│   ├── CashierLayout.tsx   # Desktop, sidebar
│   └── OwnerLayout.tsx     # Desktop, full sidebar with reports/audit
├── pages/                  # Route entry points, compose features
├── services/               # API client (axios instance)
├── styles/                 # Tailwind config, global CSS
├── types/                  # Shared TypeScript types
└── utils/                  # Formatters, validators, constants
```

### State Management Boundaries

| Layer | Tool | Examples |
|---|---|---|
| Server state | TanStack Query | Tables, menu items, orders, bills, audit logs |
| Auth token | localStorage | JWT access token, refresh token |
| URL state | React Router | Selected table, current order, active page |
| Local UI state | useState/useReducer | Modal open/close, form inputs, dropdown |
| Global app state | Zustand (add later if needed) | Only if cross-feature state becomes complex |

Rule: TanStack Query is the single source of truth for all API data. Do not duplicate server data in any other store.

### Responsive Strategy

| Device | User | Layout | Breakpoint |
|---|---|---|---|
| Mobile phone | Waiter | `WaiterLayout`, bottom navigation, touch-optimized | `< 768px` |
| Tablet | Waiter/Manager | `WaiterLayout` or `CashierLayout` | `768px – 1024px` |
| Desktop | Cashier/Owner/Manager | `CashierLayout` or `OwnerLayout`, sidebar navigation | `> 1024px` |

### Base Component Library

Phase 1 requires these shared components before building feature UIs:

- `Button` — primary, secondary, danger, ghost variants. Loading state. Disable double-click.
- `Input` — text, number, password. Error state. Label.
- `Modal` — confirm dialog, form modal. Backdrop close. ESC close.
- `Card` — content container with header, body, footer.
- `StatusBadge` — colored badges for order/table/print status.
- `EmptyState` — icon + message + optional action button.
- `LoadingSpinner` — inline and full-page variants.
- `Toast` — success, error, warning notifications. Auto-dismiss.
- `SearchInput` — debounced search with clear button.

### Feature Module Rules

- Each feature folder has an `index.ts` that exports only public API.
- Features import from other features only through `index.ts`, never deep paths.
- API calls live in `features/{name}/api/`, never in components directly.
- Feature-specific components stay inside the feature folder. Only promote to `components/` if used by 3+ features.

## Why EF Core

EF Core integrates naturally with ASP.NET Core, supports migrations, supports transactions, works with PostgreSQL through Npgsql, and keeps domain entities typed in C#.

Rules:

- use migrations for schema changes
- use transactions for critical flows
- avoid business logic inside controllers
- configure indexes
- use decimal for money

## Why PostgreSQL

PostgreSQL fits relational POS data: tenant to users, table to orders, order to order items, order to bill, bill to bill items, user to audit logs, bill to void logs, and order/bill to print jobs.

It provides transactions, foreign keys, indexes, JSONB for audit values, and strong reporting queries.

## Why FluentValidation

FluentValidation keeps request validation explicit, testable, separate from controllers, and reusable. Use it for login, create table, create menu item, add order item, cancel item, pay order, and void bill requests.

## Why JWT Auth

JWT is used for stateless authentication. Token contains user id, tenant id, role, and expiration.

Frontend sends:

```text
Authorization: Bearer <token>
```

JWT is enough for Phase 1. Future phases may add token revocation and device sessions.

## Authorization Strategy

Phase 1 uses role-based authorization.

Roles:

- owner
- manager
- cashier
- waiter

Permission checks should be implemented through helpers or policies, not scattered hardcoded role checks.

Example:

```csharp
permissionService.CanVoidBill(user)
```

Default Phase 1: owner can void bill; cashier and waiter cannot; manager can be configured later.

## Why SignalR

SignalR is selected because backend is ASP.NET Core. It replaces Socket.io.

However, **SignalR is deferred to Week 5 of Phase 1**. The MVP ships with TanStack Query polling first (2–3 seconds interval). This reduces initial complexity and lets the team focus on core business logic.

Week 1–4: polling only via TanStack Query `refetchInterval`.
Week 5+: add SignalR hub if time permits, with polling as automatic fallback.

When SignalR is added, use it for: order created, order updated, order sent to kitchen, order item cancelled, bill paid, bill voided, print job status changed.

Frontend package (install in Week 5, not Day 1):

```text
@microsoft/signalr
```

Backend hub:

```text
/hubs/restaurant
```

SignalR groups should use tenant rooms:

```text
tenant:{tenantId}
```

## Polling Strategy (Primary for Phase 1)

TanStack Query polling is the primary realtime strategy:

- Active orders page: `refetchInterval: 2000` (2 seconds).
- Table status grid: `refetchInterval: 3000` (3 seconds).
- Kitchen display: `refetchInterval: 2000` (2 seconds).
- Print job status: `refetchInterval: 2000` during active print, then stop.
- Audit logs / reports: manual refresh only, no polling.

Polling is simple, reliable, and works without WebSocket infrastructure. For a single restaurant with 10–30 tables, polling every 2–3 seconds puts minimal load on the backend.

## Why .NET Worker Service for Print Agent

Printing should not be done directly by the browser. A local .NET Worker Service fits Windows cashier machines, can run continuously, can poll backend API, can access local/network printers, and can be packaged later as a Windows Service.

Phase 1 print flow:

```text
API creates print_jobs
Print Agent polls pending jobs
Print Agent sends ESC/POS command
Print Agent updates job status
```

## Print Protocol Decision

Phase 1 prints through ESC/POS TCP/LAN first because LAN printers are easier to control than USB printers, TCP/IP printing is simple for services, and it is easier to test with IP/port. USB is not rejected, but not first priority.

## Mock Print Mode

Mock mode is required. In mock mode, the agent does not send printer commands, logs ticket content to console/file, and updates print job status.

## Docker Compose

Docker Compose is used for local PostgreSQL. Do not add Kubernetes or complex orchestration in Phase 1.

## Error Handling

Use ASP.NET Core ProblemDetails style.

## Security

### CORS

Development: allow `http://localhost:5173`.

Production: restrict to exact frontend domain only. Do not use wildcard `*`.

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", policy =>
    {
        policy.WithOrigins("https://pos.yourdomain.vn")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

### Rate Limiting

Apply rate limiting on authentication endpoints to prevent brute force:

- `POST /api/auth/login`: max 5 attempts per IP per minute.
- `POST /api/auth/refresh`: max 10 requests per IP per minute.

Use ASP.NET Core built-in rate limiting middleware (`Microsoft.AspNetCore.RateLimiting`).

### Input Validation

- All request DTOs validated with FluentValidation before reaching business logic.
- String inputs trimmed and length-limited.
- HTML/script content stripped from text fields (reason, menu item name, etc.).
- SQL injection prevented by EF Core parameterized queries (default behavior).

### HTTPS

- Production must enforce HTTPS.
- Local development can use HTTP for simplicity.
- Print agent communicates with API over local network; HTTPS optional for Phase 1 local deployment, required when deployed to cloud in Phase 3.

### Print Agent Authentication

- Phase 1: API key via `X-Print-Agent-Key` header, loaded from environment variable.
- Key must not be hardcoded in source code.
- Phase 3+: implement key rotation mechanism when deploying cloud.

### JWT Security

- Access token expiry: 60 minutes.
- Refresh token expiry: 7 days.
- JWT secret must be at least 256 bits (32 characters).
- Store JWT secret in environment variable or user secrets, never in source code.
- Refresh tokens stored as hashed values in database.

## Transaction Strategy

These operations must use EF Core transaction:

- send order to kitchen
- cancel order item
- pay order
- void bill
- create print job as part of business flow

## Testing Strategy

Phase 1 should include service tests for business rules, API tests for critical endpoints, and manual end-to-end tests.

Critical flows:

- login
- create order
- add item
- cancel pending item
- send to kitchen
- pay bill
- void bill
- fetch audit logs
- print agent polling

## Logging Strategy

### Serilog

Use Serilog for structured logging throughout the backend.

Packages:

```bash
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.File
```

### Log Levels

| Level | Usage |
|---|---|
| Fatal | Application crash, database connection lost |
| Error | Unhandled exceptions, failed transactions |
| Warning | Business rule violations (void without permission, invalid state transition) |
| Information | Successful business operations (order created, bill paid, print job completed) |
| Debug | Detailed flow tracing (EF Core queries, SignalR connection events) |

### Log Sinks

- **Console**: always enabled, structured JSON in production.
- **File**: rolling daily files, 30-day retention, stored in `logs/` directory.
- **Future**: Seq or Elasticsearch for centralized logging in Phase 3+.

### Sensitive Data

Never log:

- Passwords or password hashes.
- JWT tokens.
- Print agent API keys.

Always log:

- User ID and tenant ID on every request (via Serilog enricher).
- Request path and method.
- Response status code.
- Execution time for slow operations (> 500ms).

## Final Decision

Official stack:

```text
Frontend:
Vite React + TypeScript + TailwindCSS + TanStack Query + Zustand

Backend:
ASP.NET Core Web API (.NET 9) + EF Core + PostgreSQL + FluentValidation + JWT Auth + SignalR + Serilog

Print Agent:
.NET Worker Service + print_jobs polling + ESC/POS TCP/LAN + mock mode
```

