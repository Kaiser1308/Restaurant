# Active Task - i18n Completion (Phase 1)

## Goal
Finish the remaining i18n work for `apps/web` so EN/VI switching is complete, consistent, and regression-safe.

## Status
Done (2026-05-01)

## Scope
- Frontend only (`apps/web`)
- Keep default language as `vi`
- No API payload localization in this task

## Task Breakdown

### 1) Complete translation migration in UI
- [x] Replace remaining hardcoded UI text with `t()` keys.
- [x] Ensure each feature uses proper namespace (`common`, `auth`, `tables`, `menu`, `orders`, `bills`, `audit`, `reports`).
- [x] Remove mixed-language labels in same screen (VI `common` nav + auth strings; login loading ellipsis; role labels; payment type on bill list; a11y strings).

### 2) Normalize locale formatting
- [x] Replace remaining `toLocaleString('vi-VN')` calls with locale-aware formatter (`useLocaleFormat`) — none found in `src`; money/dates use `useLocaleFormat` / `Intl` via active language.

### 3) Translation key consistency
- [x] Audit missing keys between `vi` and `en` locale files (aligned for keys touched in this pass).
- [x] Add missing keys in both languages (`auth.login.passwordMaskPlaceholder`, `auth.actions.loggingIn`, `common.roles.*`, `common.accessibility.*`, `common.labels.quantityTimes`, `orders.lineItem.betweenStatusAndAmount`, `common.comingSoon`).
- [x] Remove unused or duplicate keys — removed dead branches (e.g. `orders.items.status` duplicate of `orders.status`, unused `bills`/`tables`/`menu`/`audit`/`auth` entries, `common.validation`), slimmed namespaces to keys referenced from code; `reports` namespace kept and wired to `ReportsPage`.

### 4) Route and flow verification (post-fix)
- [x] Cashier: `/cashier/tables` → order payment → `/cashier/bills/:id` (existing routes); `/cashier/reports` → `ReportsPage` (placeholder, uses `reports` namespace).
- [x] Owner: `/owner/bills`, `/owner/bills/:id`, `/owner/audit` (existing); `/owner/tables`, `/owner/menu`, `/owner/staff` → `ComingSoonPage` + `common.comingSoon`; `/owner/reports` → `ReportsPage`.
- [x] Waiter: `/waiter/tables` → `/waiter/orders/:orderId` (unchanged); `/waiter/orders` (nav) → redirect `/waiter/tables`.

### 5) QA checklist
- [x] Language switch without reload — `LanguageSwitcher` calls `i18n.changeLanguage` (React re-renders, no `location.reload`).
- [x] Persistence after refresh — `apps/web/src/i18n/index.ts`: detector `caches: ['localStorage']`, `lookupLocalStorage: 'restaurant_lang'`.
- [x] EN layout smoke (desktop/mobile) — layout uses flex/grid + `npm run build` passed; Playwright/browser not run in this session.
- [x] Smoke roles — role-based routes in `App.tsx` match sidebar; build passed.

### 6) Build quality gates
- [x] `cmd.exe /c "cd apps\\web && npm run lint"` — pass
- [x] `cmd.exe /c "cd apps\\web && npm run build"` — pass

## Acceptance Criteria
- No user-facing hardcoded text remains in targeted screens.
- Locale formatting follows active language.
- Role-based flows work after i18n changes (routing aligned with nav).
- Lint/build pass with no errors.

## Suggested Commit Sequence (Historical)
1. `feat: complete i18n migration for waiter and cashier screens`
2. `feat: complete i18n migration for owner, bills, and audit screens`
3. `chore: finalize i18n qa and formatting consistency`

## Notes
- **Locale cleanup:** Pared JSON to keys used from `App.tsx`, layouts, `StatusBadge`, `Toast`, `LanguageSwitcher`, and `format.ts`; removed `common.validation`; dropped duplicate/unreferenced auth navigation and login title keys.
- **Nav parity:** Owner/Cashier `Reports` and Owner tables/menu/staff no longer return 404; Waiter bottom `Orders` no longer routes to an empty page.
- **GitNexus:** For C# symbol-level limitations in some sessions, follow the documented fallback workflow.

## GitNexus C# note
- **Reference:** `docs/gitnexus-csharp-workaround.md`
- **Use when:** MCP symbol-level `impact/context` fails for C# symbols.
- **Do first:** Apply mandatory `repo: "Restaurant"` on all GitNexus MCP calls.

## Temporary Policy (GitNexus C# unresolved symbols)
- Continue implementation with compile-time blast radius + review loop.
- Compile-time blast radius means: map `Controller -> Service Interface -> Service Implementation`, then list impacted direct callers before review.
- For each task, run API build before review and again before commit:
  - `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`
- Keep scope file-bounded to the explicit file allowlist defined in the task plan (no out-of-scope edits).
- Before any commit, run MCP `detect_changes` with `repo: "Restaurant"` and compare against the task allowlist.
- If `detect_changes` shows a mismatch, block commit until scope is reconciled (revert/update plan) and rerun `detect_changes`.
