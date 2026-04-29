# Restaurant POS — Agent Instructions

## Project Overview

Restaurant POS is a monorepo with 3 apps. All project docs live in `restaurant_dotnet_docs/`.

## Environment & Commands

**All `dotnet` and `npm` commands must run through `cmd.exe /c`** — there is no native Linux dotnet SDK in WSL.

```bash
# From repo root (WSL)
cmd.exe /c "dotnet build apps\\api\\Restaurant.Api\\Restaurant.Api.csproj"
cmd.exe /c "dotnet run --project apps\\api\\Restaurant.Api"
cmd.exe /c "dotnet build apps\\print-agent\\Restaurant.PrintAgent\\Restaurant.PrintAgent.csproj"
cmd.exe /c "dotnet run --project apps\\print-agent\\Restaurant.PrintAgent"
cmd.exe /c "cd apps\\web && npm install"
cmd.exe /c "cd apps\\web && npm run build"
```

Note: `cmd.exe /c` uses backslashes for paths. The WSL path `apps/api/` becomes `apps\\api\\` in cmd.

**PostgreSQL:** `docker compose up -d` (runs natively in WSL).

## Architecture

```
apps/
├── api/Restaurant.Api/          # ASP.NET Core Web API (.NET 9)
│   └── Program.cs               # Entry point: Serilog, CORS (localhost:5173), /health
├── print-agent/Restaurant.PrintAgent/  # .NET 9 Worker Service
│   └── Worker.cs                # BackgroundService, Mock mode logging
└── web/                         # Vite React + TypeScript + TailwindCSS v4
    └── src/
        ├── components/          # Shared UI placeholders
        ├── features/{auth,tables,menu,orders,bills,audit,reports}/  # Feature modules
        │   └── each has: api/ components/ hooks/ types/
        └── layouts/             # WaiterLayout, CashierLayout, OwnerLayout
```

## Tech Stack

- **Backend:** .NET 9, ASP.NET Core Web API, Serilog (Console + File sinks)
- **Frontend:** React 19, TypeScript 6, TailwindCSS v4 (via `@tailwindcss/vite` plugin, NOT PostCSS), TanStack Query, React Router, Axios
- **Database:** PostgreSQL 16 (Docker Compose, port 5432)
- **Print Agent:** .NET 9 Worker Service, polls API in Mock mode

## API

- Default port: `5141` (set in `launchSettings.json`), not 5000. The `.env.example` says 5000 but launchSettings overrides it.
- Health endpoint: `GET /health` → `{ success: true, message: "Restaurant API is running" }`
- CORS policy `"Development"` allows `http://localhost:5173`
- Serilog config lives in `appsettings.Development.json`, writes to `logs/` with daily rolling

## Frontend

- TailwindCSS v4 uses `@import "tailwindcss"` in CSS — no `tailwind.config.js`, no PostCSS config
- `npm run build` runs `tsc -b && vite build` (typecheck is part of build)
- `npm run lint` runs ESLint
- Feature modules: each feature has `api/`, `components/`, `hooks/`, `types/` subfolders

## Conventions

- Commit style: conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`)
- C# style: 4-space indent, PascalCase types, camelCase locals, `Async` suffix on async methods
- TS style: follows Vite template defaults, ESLint + typescript-eslint
- No hard delete for orders, order items, bills — status changes only
- Money: `decimal(18,2)` in DB, `decimal` in C#
- All business tables must include `tenant_id`

## Key Docs

| Doc | What it defines |
|-----|-----------------|
| `restaurant_dotnet_docs/MVP_SPEC.md` | Product spec, users, user flows, business rules, out-of-scope |
| `restaurant_dotnet_docs/TECH_DECISIONS.md` | Architecture (Controller→Service→Repository), state management rules, layer rules |
| `restaurant_dotnet_docs/DB_SCHEMA_V1.md` | All entities, enums, indexes, constraints, EF Core config rules |
| `restaurant_dotnet_docs/API_CONTRACT_V1.md` | All endpoints, request/response shapes, polling intervals, SignalR events |
| `restaurant_dotnet_docs/PHASE_1_TASKS.md` | Week-by-week task breakdown (Day 1–42) |
| `restaurant_dotnet_docs/DAY_1_SETUP_PROMPT.md` | Day 1 scaffold instructions (already completed) |

## Guardrails

- Do NOT install Zustand or `@microsoft/signalr` yet — deferred per TECH_DECISIONS.md
- Do NOT add EF Core until Day 3 (PHASE_1_TASKS.md)
- Do NOT build: Next.js, Node backend, Prisma, Socket.io, Redis, Electron, native mobile
- Realtime strategy: TanStack Query polling first (2–3s), SignalR optional in Week 5
- Never commit secrets — use `.env.example` as template

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Restaurant** (528 symbols, 578 relationships, 0 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Restaurant/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Restaurant/clusters` | All functional areas |
| `gitnexus://repo/Restaurant/processes` | All execution flows |
| `gitnexus://repo/Restaurant/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
