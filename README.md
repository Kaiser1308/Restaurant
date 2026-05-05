# Restaurant POS

Restaurant POS is a monorepo for a small and medium restaurant point-of-sale system. The MVP focuses on fast dine-in operations while preserving auditability for money, orders, cancellations, voids, and print jobs.

## Core Principles

- Orders, order items, bills, bill items, void logs, audit logs, and print jobs are never hard deleted.
- Cancel and void actions require reasons.
- Owners can review audit logs and sensitive staff actions.
- Kitchen tickets and cashier bills are tracked through print jobs.
- `tenant_id` exists from the beginning, even though Phase 1 uses one seeded tenant.
- Realtime behavior starts with TanStack Query polling; SignalR is deferred until it is needed.

## Tech Stack

Frontend:

- Vite React + TypeScript
- TailwindCSS v4 through `@tailwindcss/vite`
- TanStack Query
- React Router
- Axios
- i18next + react-i18next

Backend:

- ASP.NET Core Web API (.NET 9)
- Entity Framework Core
- PostgreSQL 16
- FluentValidation
- JWT auth
- Serilog

Print agent:

- .NET 9 Worker Service
- Polls API print jobs
- Mock mode first
- ESC/POS TCP/LAN target

## Repository Structure

```text
apps/
  api/Restaurant.Api/              ASP.NET Core Web API
  print-agent/Restaurant.PrintAgent/ .NET Worker Service
  web/                             Vite React frontend
deploy/                            Deployment files
docs/                              Project plans and implementation docs
restaurant_dotnet_docs/            Product, API, schema, and architecture docs
scripts/                           Verification and maintenance scripts
docker-compose.yml                 Local PostgreSQL and MinIO services
```

## Local Development

All `dotnet` and `npm` commands should run through `cmd.exe /c` when working from this workspace. The .NET SDK and Node tooling are expected on Windows.

### 1. Start Infrastructure

```bash
docker compose up -d
```

PostgreSQL runs on `localhost:5432`. MinIO runs on `localhost:9000`, with the console on `localhost:9001`.

### 2. Start API

```bash
cmd.exe /c "dotnet run --project apps\\api\\Restaurant.Api"
```

The API uses port `5141` in development.

- Health: `http://localhost:5141/health`
- Swagger: `http://localhost:5141/swagger`

### 3. Start Web

```bash
cmd.exe /c "cd apps\\web && npm install"
cmd.exe /c "cd apps\\web && npm run dev"
```

The web app runs on `http://localhost:5173`.

### 4. Optional: Start Print Agent

```bash
cmd.exe /c "dotnet run --project apps\\print-agent\\Restaurant.PrintAgent"
```

The print agent currently supports mock-mode polling for print jobs.

## Build And Verification

```bash
cmd.exe /c "dotnet build apps\\api\\Restaurant.Api\\Restaurant.Api.csproj"
cmd.exe /c "dotnet build apps\\print-agent\\Restaurant.PrintAgent\\Restaurant.PrintAgent.csproj"
cmd.exe /c "cd apps\\web && npm run build"
powershell -ExecutionPolicy Bypass -File scripts/verify-architecture.ps1
```

Useful local checks:

```bash
docker ps
curl http://localhost:5141/health
cmd.exe /c "cd apps\\web && npm run lint"
```

## Frontend Architecture

- `apps/web/src/App.tsx` contains app bootstrap only.
- Route definitions live in `apps/web/src/app/router.tsx`.
- Page-level composition lives in `apps/web/src/pages/`.
- Feature modules live under `apps/web/src/features/{auth,tables,menu,orders,bills,audit,reports}/`.
- Each feature exposes its public API through `index.ts`.
- App code should use `@/` imports.
- New UI text must include Vietnamese and English translations.

## Backend Architecture

The backend follows `Controller -> Service -> Repository`.

- Controllers stay thin and call services.
- Services contain business rules and transaction orchestration.
- Repositories encapsulate EF Core data access.
- DTO inputs use `Request` suffix; outputs use `Response` suffix.
- Async methods use the `Async` suffix.
- Backend write paths must use `RequireTenantId()`, `RequireUserId()`, and `RequireRole()` instead of direct tenant context property access.

## Internationalization

The web app uses feature-based i18n namespaces in:

```text
apps/web/src/i18n/locales/vi/
apps/web/src/i18n/locales/en/
```

Use namespace hooks:

```typescript
const { t } = useTranslation('orders')
t('actions.create')
```

Do not use key-prefix style such as `t('orders.actions.create')` from the default namespace.

Use `useLocaleFormat()` from `apps/web/src/utils/format.ts` for money, date, and time formatting.

## Key Documentation

- `restaurant_dotnet_docs/MVP_SPEC.md`: product scope, user flows, and business rules.
- `restaurant_dotnet_docs/TECH_DECISIONS.md`: architecture and stack decisions.
- `restaurant_dotnet_docs/DB_SCHEMA_V1.md`: database entities, constraints, and indexes.
- `restaurant_dotnet_docs/API_CONTRACT_V1.md`: endpoint contracts and response shapes.
- `restaurant_dotnet_docs/PHASE_1_TASKS.md`: phase breakdown.
- `docs/superpowers/specs/2026-04-30-i18n-design.md`: approved i18n design.

## Guardrails

- Do not commit real `.env` files or secrets.
- Do not add Next.js, Node backend, Prisma, Socket.io, Redis, Electron, or native mobile app code.
- Do not install Zustand or `@microsoft/signalr` until the relevant phase explicitly needs them.
- Prefer vertical slices that move DB, API, and UI together.
- Stop for direction before route changes, API contract changes, exception taxonomy changes, new shared cross-domain modules, or scope expansion.
