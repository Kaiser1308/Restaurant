# Day 1 Setup Prompt — Restaurant POS (.NET Stack)

You are a senior full-stack engineer. Set up Day 1 foundation for a project named **Restaurant**.

## Official Tech Stack

Frontend:

- Vite React
- TypeScript
- TailwindCSS
- TanStack Query
- Zustand
- React Router
- `@microsoft/signalr`

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
- Polling `print_jobs`
- ESC/POS TCP/LAN first
- Mock mode

## Day 1 Goal

Create the initial project foundation only.

At the end of Day 1, the repo must have:

- A clean monorepo structure.
- Vite React frontend running.
- ASP.NET Core Web API running with `/health`.
- .NET Worker Service print-agent running with simple log loop.
- Docker Compose PostgreSQL config.
- Basic README.
- `.gitignore`.
- `.env.example`.
- No POS business features yet.

Do not implement:

- Auth
- EF Core schema
- Orders
- Bills
- Print job logic
- Audit log
- SignalR events
- Menu/table features

## Required Folder Structure

Create:

```text
restaurant/
├── apps/
│   ├── web/
│   ├── api/
│   │   └── Restaurant.Api/
│   └── print-agent/
│       └── Restaurant.PrintAgent/
├── docs/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Step 1: Initialize Repository

Commands:

```bash
mkdir restaurant
cd restaurant
git init
mkdir apps docs
mkdir apps/web apps/api apps/print-agent
```

Create `.gitignore`:

```gitignore
node_modules
dist
build
.env
.env.local
.vscode
bin
obj
TestResults
coverage
.DS_Store
```

## Step 2: Create Docker Compose for PostgreSQL

Create `docker-compose.yml`:

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16
    container_name: restaurant_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: restaurant_db
      POSTGRES_USER: restaurant_user
      POSTGRES_PASSWORD: restaurant_pass
    ports:
      - "5432:5432"
    volumes:
      - restaurant_postgres_data:/var/lib/postgresql/data

volumes:
  restaurant_postgres_data:
```

## Step 3: Create Environment Example

Create `.env.example`:

```env
# API
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://localhost:5000

# Database
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=restaurant_db;Username=restaurant_user;Password=restaurant_pass

# Auth
Jwt__Issuer=Restaurant
Jwt__Audience=Restaurant.Web
Jwt__Secret=change_me_to_a_long_secret
Jwt__AccessTokenMinutes=60

# Web
VITE_API_URL=http://localhost:5000
VITE_SIGNALR_URL=http://localhost:5000/hubs/restaurant

# Print Agent
PrintAgent__ApiBaseUrl=http://localhost:5000
PrintAgent__AgentKey=dev_print_agent_key
PrintAgent__PollingIntervalSeconds=3
PrintAgent__PrintMode=Mock
```

## Step 4: Create ASP.NET Core Web API

Commands:

```bash
cd apps/api
dotnet new webapi -n Restaurant.Api
cd Restaurant.Api
dotnet run
```

Modify the API so it exposes:

```http
GET /health
```

Expected response:

```json
{
  "success": true,
  "message": "Restaurant API is running"
}
```

Enable CORS for local frontend:

```text
http://localhost:5173
```

Install and configure Serilog:

```bash
cd Restaurant.Api
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.File
```

Add Serilog to `Program.cs`:

```csharp
builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration));

// After building the app:
app.UseSerilogRequestLogging();
```

Add Serilog config to `appsettings.Development.json`:

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft.AspNetCore": "Warning",
        "Microsoft.EntityFrameworkCore": "Warning"
      }
    },
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "File",
        "Args": {
          "path": "logs/log-.txt",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30
        }
      }
    ]
  }
}
```

Do not add EF Core yet on Day 1 unless required for the template.

## Step 5: Create .NET Worker Print Agent

Commands:

```bash
cd ../../print-agent
dotnet new worker -n Restaurant.PrintAgent
cd Restaurant.PrintAgent
dotnet run
```

Modify Worker so it logs:

```text
Restaurant Print Agent running in Mock mode
```

every few seconds.

Add basic `appsettings.Development.json` keys:

```json
{
  "PrintAgent": {
    "ApiBaseUrl": "http://localhost:5000",
    "AgentKey": "dev_print_agent_key",
    "PollingIntervalSeconds": 3,
    "PrintMode": "Mock"
  }
}
```

Do not implement print job polling yet.

## Step 6: Create Vite React Frontend

Commands:

```bash
cd ../../web
npm create vite@latest . -- --template react-ts
npm install
npm install @tanstack/react-query react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev
```

Set up Tailwind basics in `src/index.css`.

Create a simple home page:

```text
Restaurant POS
```

Scaffold the base component library:

```bash
mkdir src/components
```

Create placeholder files for shared components:

- `src/components/Button.tsx`
- `src/components/Input.tsx`
- `src/components/Modal.tsx`
- `src/components/Card.tsx`
- `src/components/StatusBadge.tsx`
- `src/components/EmptyState.tsx`
- `src/components/LoadingSpinner.tsx`
- `src/components/Toast.tsx`

Scaffold feature folder structure:

```bash
mkdir -p src/features/auth/api src/features/auth/components src/features/auth/hooks src/features/auth/stores src/features/auth/types
mkdir -p src/features/tables/api src/features/tables/components src/features/tables/hooks src/features/tables/types
mkdir -p src/features/menu/api src/features/menu/components src/features/menu/hooks src/features/menu/types
mkdir -p src/features/orders/api src/features/orders/components src/features/orders/hooks src/features/orders/types
mkdir -p src/features/bills/api src/features/bills/components src/features/bills/hooks src/features/bills/types
mkdir -p src/features/audit/api src/features/audit/components src/features/audit/hooks src/features/audit/types
mkdir -p src/features/reports/api src/features/reports/components src/features/reports/hooks src/features/reports/types
mkdir -p src/layouts src/hooks src/services src/types src/utils src/pages
```

Create layout placeholders:

- `src/layouts/WaiterLayout.tsx` — mobile-optimized, bottom navigation.
- `src/layouts/CashierLayout.tsx` — desktop, sidebar.
- `src/layouts/OwnerLayout.tsx` — desktop, full sidebar with reports/audit.

No real UI screens yet.

## Step 7: Create README

Create root `README.md`:

```md
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
- Zustand

Backend:
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- FluentValidation
- JWT Auth
- SignalR

Print Agent:
- .NET Worker Service
- Polling print_jobs
- ESC/POS TCP/LAN first
- Mock mode
```

## Step 8: Test Commands

Run these from root where appropriate:

```bash
docker compose up -d
docker ps

dotnet run --project apps/api/Restaurant.Api
curl http://localhost:5000/health

dotnet run --project apps/print-agent/Restaurant.PrintAgent

cd apps/web
npm run dev
```

Expected:

- PostgreSQL container is running.
- API health returns success.
- Web app opens at `http://localhost:5173`.
- Print agent logs running message.
- No business feature is implemented yet.

## Step 9: Commit

From root:

```bash
git add .
git commit -m "chore: initialize Restaurant .NET stack foundation"
```

## Final Output Required

When finished, report:

- Folder structure created.
- Commands run.
- How to start PostgreSQL.
- How to start API.
- How to start Web.
- How to start Print Agent.
- Any error encountered and how it was fixed.
