# Restaurant POS — Agent Instructions

## Project Overview

Restaurant POS is a monorepo with 3 apps. All project docs live in `restaurant_dotnet_docs/`.

## Environment & Commands

**All `dotnet` and `npm` commands must run through `cmd.exe /c`** — there is no native Linux dotnet SDK in WSL.

### Startup Order (Critical)

```bash
# 1. Start PostgreSQL first (WSL, no cmd needed)
docker compose up -d

# 2. Start API (runs migrations and seeds data on startup)
cmd.exe /c "dotnet run --project apps\\api\\Restaurant.Api"

# 3. Start web dev server (in another terminal)
cmd.exe /c "cd apps\\web && npm run dev"

# 4. Optional: Start print agent (in another terminal)
cmd.exe /c "dotnet run --project apps\\print-agent\\Restaurant.PrintAgent"
```

### Build Commands

```bash
# From repo root (WSL)
cmd.exe /c "dotnet build apps\\api\\Restaurant.Api\\Restaurant.Api.csproj"
cmd.exe /c "dotnet build apps\\print-agent\\Restaurant.PrintAgent\\Restaurant.PrintAgent.csproj"
cmd.exe /c "cd apps\\web && npm install"
cmd.exe /c "cd apps\\web && npm run build"
```

### Database Migrations

```bash
# Create a new migration (from api directory)
cmd.exe /c "dotnet ef migrations add MigrationName --project apps\\api\\Restaurant.Api"

# Migrations are auto-applied on API startup via Program.cs:119
```

Note: `cmd.exe /c` uses backslashes for paths. The WSL path `apps/api/` becomes `apps\\api\\` in cmd.

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

## i18n (Internationalization)

**Packages:** `i18next`, `react-i18next`, `i18next-browser-languagedetector`

**Architecture:**
- Namespace-by-feature structure in `apps/web/src/i18n/locales/vi/` and `en/`
- Namespaces: `common`, `auth`, `tables`, `menu`, `orders`, `bills`, `audit`, `reports`
- Default language: Vietnamese (`vi`), fallback: English (`en`)
- Auto-detect: `vi-VN` → `vi`, `en-US` → `en`, others → `vi`

**Key Convention:** `feature.section.element` format
- Examples: `auth.login.title`, `orders.actions.create`, `bills.actions.pay`
- Vietnamese glossary of 20 business terms standardized: `bàn` → Table, `món` → Item/Dish

**Translation Hook Usage:**
```typescript
// In feature components
import { useTranslation } from 'react-i18next'
const { t } = useTranslation('orders')  // Load specific namespace

// Usage
<h1>{t('title')}</h1>  // Uses 'orders.title'
<Button>{t('actions.create')}</Button>
```

**Namespace Rules:**
- Use `useTranslation('namespace')` to load specific namespace
- Then call `t('key')` - NOT `t('namespace.key')`
- Example: `const { t } = useTranslation('orders'); t('title')` ✅ CORRECT
- Example: `const { t } = useTranslation(); t('orders.title')` ❌ WRONG (key-prefix style)

**Language Switcher:**
- Component: `apps/web/src/components/LanguageSwitcher.tsx`
- Integration points: All three layouts (WaiterLayout, CashierLayout, OwnerLayout)
- Persist to `localStorage`, auto-detect from browser on first visit
- No page reload when switching languages

**Locale Formatting:**
- Location: `apps/web/src/utils/format.ts`
- Hook: `useLocaleFormat()` - returns `formatMoney()`, `formatDateTime()`, `formatDate()`, `formatTime()`
- Uses native `Intl` APIs: `Intl.NumberFormat` for VND currency, `Intl.DateTimeFormat` for dates/times
- Replace existing `.toLocaleString('vi-VN')` calls with format helpers

**Migration Strategy (Vertical Slices):**
- Batch 1: Common + Auth (buttons, labels, login, logout)
- Batch 2: Tables + Menu (table status, menu items, categories)
- Batch 3: Orders + Bills (order actions, payment, void)
- Batch 4: Audit + Reports (audit logs, reports filters)

**Guideline:** Any new UI text MUST add both `vi` and `en` translations in appropriate namespace.

## Environment

- **Database**: PostgreSQL 16 via Docker Compose (port 5432)
- **API Port**: 5141 (configured in `launchSettings.json`, overrides `.env.example`)
- **JWT Secret**: In Development mode, API falls back to `"development-only-jwt-secret-change-before-production"` if `JWT_SECRET` env var is missing (Program.cs:166-169)
- **Print Agent**: Polls API every 3 seconds in Mock mode (configurable via `PrintAgent__PollingIntervalSeconds`)
- Use `.env.example` as template, but **never commit** actual `.env` file

### Verification

```bash
# Verify database is running
docker ps | grep postgres

# Verify API is healthy
curl http://localhost:5141/health

# Verify frontend dev server is running (check http://localhost:5173)

# Verify frontend builds without errors
cmd.exe /c "cd apps\\web && npm run build"
```

## Conventions

- **Commit Style:** Conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`) - ALL LOWERCASE.
- **Backend (C#):**
    - `PascalCase` for Types, `camelCase` for locals.
    - **MUST** use `Async` suffix for all async methods (e.g., `GetOrdersAsync`).
    - **DTOs:** Use `Request` suffix for inputs and `Response` for outputs (e.g., `LoginRequest`). Avoid `Dto` suffix.
    - **Architecture:** `Controller -> Service -> Repository`. Services must not use `DbContext` directly.
- **Database (PostgreSQL):**
    - `PascalCase` in C#, but **MUST** use `snake_case` in DB (via `EFCore.NamingConventions`).
    - **Money:** `decimal(18,2)` in DB, `decimal` in C#.
    - All business tables must include `tenant_id`.
    - **Soft Delete:** No hard deletes for orders, order items, or bills — status changes only.
- **Frontend (TS/React):**
    - `PascalCase` for Components, `camelCase` for utils/api files.
    - **Absolute Paths:** Always use `@/` alias (e.g., `import { Button } from '@/components/Button'`).
    - **Hooks:** `use` + `PascalCase` (e.g., `useAuth`, `useTableStatus`).
    - **Types:** `PascalCase`, no `I` prefix for interfaces.

## Key Docs

| Doc | What it defines |
|-----|-----------------|
| `restaurant_dotnet_docs/MVP_SPEC.md` | Product spec, users, user flows, business rules, out-of-scope |
| `restaurant_dotnet_docs/TECH_DECISIONS.md` | Architecture (Controller→Service→Repository), state management rules, layer rules |
| `restaurant_dotnet_docs/DB_SCHEMA_V1.md` | All entities, enums, indexes, constraints, EF Core config rules |
| `restaurant_dotnet_docs/API_CONTRACT_V1.md` | All endpoints, request/response shapes, polling intervals, SignalR events |
| `restaurant_dotnet_docs/PHASE_1_TASKS.md` | Week-by-week task breakdown (Day 1–42) |
| `restaurant_dotnet_docs/DAY_1_SETUP_PROMPT.md` | Day 1 scaffold instructions (already completed) |
| `docs/superpowers/specs/2026-04-30-i18n-design.md` | i18n implementation design for web app (approved) |

## Guardrails

- Do NOT install Zustand or `@microsoft/signalr` yet — deferred per TECH_DECISIONS.md
- **Vertical Slice:** Build features end-to-end (DB -> API -> UI) one by one.
- Do NOT build: Next.js, Node backend, Prisma, Socket.io, Redis, Electron, native mobile
- Realtime strategy: TanStack Query polling first (2–3s), SignalR optional in Week 5
- Never commit secrets — use `.env.example` as template

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Restaurant**. Check `.gitnexus/meta.json` for current symbol counts and relationships. Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/Restaurant/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Restaurant/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Restaurant/clusters` | All functional areas |
| `gitnexus://repo/Restaurant/processes` | All execution flows |
| `gitnexus://repo/Restaurant/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

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
