# Restaurant POS

> README song ngữ: Tiếng Việt trước, English bên cạnh để dễ đọc trên GitHub.

Restaurant POS is a monorepo for a small and medium restaurant point-of-sale MVP. The system is built around fast dine-in ordering, traceable payments, audit logs, and print-job tracking for kitchen tickets and cashier bills.

| Tiếng Việt | English |
|---|---|
| Hệ thống POS cho nhà hàng vừa và nhỏ, tập trung vào quy trình ăn tại bàn. | A POS system for small and medium dine-in restaurants. |
| MVP ưu tiên tốc độ thao tác cho nhân viên và khả năng kiểm soát tiền, đơn, bill, hủy món, void bill cho chủ quán. | The MVP prioritizes staff speed while preserving owner visibility into money, orders, bills, cancellations, and voids. |
| Món, đơn, bill, audit log và print job không bị xóa cứng; các hành động nhạy cảm phải có lý do. | Orders, bills, audit logs, and print jobs are not hard deleted; sensitive actions require reasons. |
| Phase 1 chạy một tenant mặc định nhưng schema đã có `tenant_id` ngay từ đầu. | Phase 1 runs one seeded tenant, while the schema includes `tenant_id` from the beginning. |

## Project Status

| Tiếng Việt | English |
|---|---|
| Đây là monorepo đang phát triển cho MVP 5-6 tuần. | This is an active monorepo for a 5-6 week MVP. |
| Frontend đã có kiến trúc feature-based, i18n Việt/Anh, layout theo vai trò waiter/cashier/owner. | The frontend has feature-based modules, Vietnamese/English i18n, and role-based waiter/cashier/owner layouts. |
| Backend dùng ASP.NET Core Web API, EF Core, PostgreSQL, JWT auth và Serilog. | The backend uses ASP.NET Core Web API, EF Core, PostgreSQL, JWT auth, and Serilog. |
| Print agent là .NET Worker Service, hỗ trợ mock-mode polling trước khi kết nối máy in ESC/POS TCP/LAN. | The print agent is a .NET Worker Service with mock-mode polling before ESC/POS TCP/LAN printer integration. |

## Core Workflow

| Tiếng Việt | English |
|---|---|
| Waiter tạo order theo bàn. | Waiter creates an order for a table. |
| Món mới được gửi xuống bếp và tạo kitchen print job. | New items are sent to kitchen and create kitchen print jobs. |
| Cashier tạo và thanh toán bill từ order. | Cashier creates and pays a bill from the order. |
| Bill được in và lưu snapshot món tại thời điểm thanh toán. | The bill is printed and stores item snapshots at payment time. |
| Owner xem audit log, void log, bill và hành động nhạy cảm. | Owner reviews audit logs, void logs, bills, and sensitive actions. |

## Tech Stack

| Layer | Tiếng Việt | English |
|---|---|---|
| Frontend | Vite, React 19, TypeScript 6, TailwindCSS v4, TanStack Query, React Router, Axios, i18next. | Vite, React 19, TypeScript 6, TailwindCSS v4, TanStack Query, React Router, Axios, i18next. |
| Backend | ASP.NET Core Web API (.NET 9), Entity Framework Core, FluentValidation, JWT auth, Serilog. | ASP.NET Core Web API (.NET 9), Entity Framework Core, FluentValidation, JWT auth, Serilog. |
| Database | PostgreSQL 16 qua Docker Compose. | PostgreSQL 16 through Docker Compose. |
| Object Storage | MinIO local, bucket `restaurant-images`. | Local MinIO with the `restaurant-images` bucket. |
| Print Agent | .NET 9 Worker Service, polling API print jobs, mock mode first. | .NET 9 Worker Service, API print-job polling, mock mode first. |

## Repository Structure

```text
apps/
  api/Restaurant.Api/                 ASP.NET Core Web API
  print-agent/Restaurant.PrintAgent/  .NET Worker Service print agent
  web/                                Vite React frontend
deploy/                               Deployment files
docs/                                 Project plans and implementation notes
restaurant_dotnet_docs/               Product, API, database, and architecture docs
scripts/                              Verification and maintenance scripts
tests/                                Backend test projects
docker-compose.yml                    Local PostgreSQL and MinIO services
```

| Tiếng Việt | English |
|---|---|
| `apps/web/src/app/router.tsx` chứa route definitions. | `apps/web/src/app/router.tsx` contains route definitions. |
| `apps/web/src/pages/` chứa page-level composition. | `apps/web/src/pages/` contains page-level composition. |
| `apps/web/src/features/` chứa các feature module hiện có: `auth`, `tables`, `menu`, `orders`, `bills`, `audit`, `reports`, `print-jobs`. | `apps/web/src/features/` contains the current feature modules: `auth`, `tables`, `menu`, `orders`, `bills`, `audit`, `reports`, `print-jobs`. |
| `apps/web/src/i18n/locales/vi` và `en` chứa translation theo namespace. | `apps/web/src/i18n/locales/vi` and `en` contain namespace-based translations. |

## Local Development

All `dotnet` and `npm` commands should run through `cmd.exe /c` in this workspace because the Windows toolchain is used from the shared environment.

| Bước | Tiếng Việt | English | Command |
|---|---|---|---|
| 1 | Khởi động PostgreSQL và MinIO. | Start PostgreSQL and MinIO. | `docker compose up -d` |
| 2 | Chạy API, migrations/seeding được xử lý khi app startup. | Run the API; migrations/seeding run during startup. | `cmd.exe /c "dotnet run --project apps\\api\\Restaurant.Api"` |
| 3 | Cài dependency frontend nếu cần. | Install frontend dependencies if needed. | `cmd.exe /c "cd apps\\web && npm install"` |
| 4 | Chạy web dev server. | Start the web dev server. | `cmd.exe /c "cd apps\\web && npm run dev"` |
| 5 | Tùy chọn: chạy print agent. | Optional: run the print agent. | `cmd.exe /c "dotnet run --project apps\\print-agent\\Restaurant.PrintAgent"` |

## Local URLs

| Service | URL | Notes |
|---|---|---|
| Web app | `http://localhost:5173` | Vite development server |
| API | `http://localhost:5141` | ASP.NET Core development profile |
| API health | `http://localhost:5141/health` | Returns API health status |
| Swagger | `http://localhost:5141/swagger` | API documentation in development |
| PostgreSQL | `localhost:5432` | `restaurant_db` / `restaurant_user` |
| MinIO API | `http://localhost:9000` | Local object storage |
| MinIO Console | `http://localhost:9001` | Local storage console |

## Build And Verification

| Tiếng Việt | English | Command |
|---|---|---|
| Build API. | Build the API. | `cmd.exe /c "dotnet build apps\\api\\Restaurant.Api\\Restaurant.Api.csproj"` |
| Build print agent. | Build the print agent. | `cmd.exe /c "dotnet build apps\\print-agent\\Restaurant.PrintAgent\\Restaurant.PrintAgent.csproj"` |
| Build frontend, bao gồm typecheck. | Build the frontend, including typecheck. | `cmd.exe /c "cd apps\\web && npm run build"` |
| Chạy ESLint frontend. | Run frontend ESLint. | `cmd.exe /c "cd apps\\web && npm run lint"` |
| Kiểm tra guardrails kiến trúc. | Verify architecture guardrails. | `powershell -ExecutionPolicy Bypass -File scripts/verify-architecture.ps1` |

## Architecture Rules

| Tiếng Việt | English |
|---|---|
| Backend theo luồng `Controller -> Service -> Repository`. | Backend flow follows `Controller -> Service -> Repository`. |
| Controller mỏng, service giữ business rules, repository bọc EF Core data access. | Controllers stay thin, services hold business rules, repositories wrap EF Core data access. |
| DTO input dùng suffix `Request`; output dùng suffix `Response`. | Input DTOs use `Request`; output DTOs use `Response`. |
| Async methods phải có suffix `Async`. | Async methods must use the `Async` suffix. |
| Frontend dùng feature modules và public API qua `index.ts`. | Frontend uses feature modules with public APIs exposed through `index.ts`. |
| App code ưu tiên import bằng alias `@/`. | App code should prefer `@/` imports. |
| UI text mới phải có cả bản dịch `vi` và `en`. | New UI text must include both `vi` and `en` translations. |

## Internationalization

| Tiếng Việt | English |
|---|---|
| Ngôn ngữ mặc định là Tiếng Việt (`vi`), fallback là English (`en`). | Default language is Vietnamese (`vi`), fallback is English (`en`). |
| Translation chia theo namespace feature: `common`, `auth`, `tables`, `menu`, `orders`, `bills`, `audit`, `reports`. | Translations are split by feature namespaces: `common`, `auth`, `tables`, `menu`, `orders`, `bills`, `audit`, `reports`. |
| Component nên gọi `useTranslation('orders')` rồi dùng `t('actions.create')`. | Components should call `useTranslation('orders')`, then use `t('actions.create')`. |
| Format tiền, ngày, giờ nên dùng `useLocaleFormat()` trong `apps/web/src/utils/format.ts`. | Money, date, and time formatting should use `useLocaleFormat()` from `apps/web/src/utils/format.ts`. |

```typescript
const { t } = useTranslation('orders')

t('actions.create')
```

## Key Documentation

| Document | Tiếng Việt | English |
|---|---|---|
| `restaurant_dotnet_docs/MVP_SPEC.md` | Phạm vi sản phẩm, user flow, business rules. | Product scope, user flows, and business rules. |
| `restaurant_dotnet_docs/TECH_DECISIONS.md` | Quyết định stack và kiến trúc. | Stack and architecture decisions. |
| `restaurant_dotnet_docs/DB_SCHEMA_V1.md` | Entity, constraint, index và EF Core rules. | Entities, constraints, indexes, and EF Core rules. |
| `restaurant_dotnet_docs/API_CONTRACT_V1.md` | Endpoint contract và response shapes. | Endpoint contracts and response shapes. |
| `restaurant_dotnet_docs/PHASE_1_TASKS.md` | Kế hoạch theo tuần/ngày cho Phase 1. | Week/day plan for Phase 1. |
| `docs/superpowers/specs/2026-04-30-i18n-design.md` | Thiết kế i18n đã được approve. | Approved i18n design. |

## Guardrails

| Tiếng Việt | English |
|---|---|
| Không commit `.env` thật hoặc secrets. | Do not commit real `.env` files or secrets. |
| Không thêm Next.js, Node backend, Prisma, Socket.io, Redis, Electron, native mobile vào MVP hiện tại. | Do not add Next.js, Node backend, Prisma, Socket.io, Redis, Electron, or native mobile to the current MVP. |
| Không install Zustand hoặc `@microsoft/signalr` cho đến khi phase cần thật sự. | Do not install Zustand or `@microsoft/signalr` until a phase genuinely needs them. |
| Ưu tiên vertical slices: DB -> API -> UI. | Prefer vertical slices: DB -> API -> UI. |
| Dừng lại xin hướng dẫn trước khi đổi route, API contract, exception taxonomy, hoặc tạo shared cross-domain module mới. | Stop for direction before route changes, API contract changes, exception taxonomy changes, or a new shared cross-domain module. |

## License

| Tiếng Việt | English |
|---|---|
| Chưa khai báo license công khai. Hãy thêm file `LICENSE` trước khi phát hành public. | No public license is declared yet. Add a `LICENSE` file before public distribution. |
