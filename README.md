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

## Getting Started

### Prerequisites

- .NET 9 SDK
- Node.js 18+
- Docker Desktop

### Start PostgreSQL

```bash
docker compose up -d
```

### Start API

```bash
dotnet run --project apps/api/Restaurant.Api
```

Health check: `curl http://localhost:5000/health`

### Start Web

```bash
cd apps/web
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Start Print Agent

```bash
dotnet run --project apps/print-agent/Restaurant.PrintAgent
```

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
