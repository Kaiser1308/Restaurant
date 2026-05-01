# Restaurant

Restaurant is a POS system for small and medium restaurants.

## Vision

Fast restaurant operations with transparent cash flow.

Core principles:

- No hard delete for orders, order items, and bills
- Cancel and void actions require reasons
- Owner can review audit logs
- Kitchen and cashier printing are tracked
- Built with a .NET backend and React frontend

## Stack

Frontend:
- Vite React
- TypeScript
- TailwindCSS
- TanStack Query
- React Router

Backend:
- ASP.NET Core Web API (.NET 9)
- Entity Framework Core
- PostgreSQL
- FluentValidation
- JWT Auth
- SignalR
- Serilog

Print Agent:
- .NET Worker Service
- Polling print_jobs
- ESC/POS TCP/LAN first
- Mock mode

## Hướng dẫn chạy dự án (Getting Started)

Dự án này là một Monorepo. Bạn nên mở toàn bộ thư mục `Restaurant` bằng VS Code.

### 1. Khởi động Database (Docker)
Yêu cầu đã cài đặt Docker Desktop. Mở terminal tại thư mục gốc và chạy:
```bash
docker compose up -d
```
*Database sẽ chạy tại `localhost:5432`.*

### 2. Khởi động Backend (API)
Mở một terminal mới và chạy lệnh sau (Lưu ý dùng cổng `5141` theo cấu hình):
```bash
dotnet run --project apps/api/Restaurant.Api
```
*Kiểm tra sức khỏe tại: `http://localhost:5141/health`*
*Xem tài liệu API (Swagger): `http://localhost:5141/swagger`*

### 3. Khởi động Frontend (Web)
Mở một terminal mới, di chuyển vào thư mục web và chạy:
```bash
cd apps/web
npm install
npm run dev
```
*Giao diện web sẽ chạy tại: `http://localhost:5173`*

### 4. Khởi động Print Agent (Máy in)
Nếu bạn muốn thử nghiệm tính năng in ấn (chế độ Mock), mở một terminal mới và chạy:
```bash
dotnet run --project apps/print-agent/Restaurant.PrintAgent
```

> **Lưu ý cho Windows/WSL:** 
> Nếu bạn đang dùng WSL nhưng cài .NET SDK trên Windows, hãy chạy các lệnh dotnet thông qua `cmd.exe /c`.

## Project Structure

```text
restaurant/
├── apps/
│   ├── web/                    # Vite React frontend
│   ├── api/
│   │   └── Restaurant.Api/     # ASP.NET Core Web API
│   └── print-agent/
│       └── Restaurant.PrintAgent/  # .NET Worker Service
├── docs/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```
