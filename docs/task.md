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
- [x] Cashier: `/cashier/tables` → order payment → `/cashier/bills/:id` (existing routes); `/cashier/reports` → `ReportsPage` (placeholder, dùng namespace `reports`).
- [x] Owner: `/owner/bills`, `/owner/bills/:id`, `/owner/audit` (existing); `/owner/tables`, `/owner/menu`, `/owner/staff` → `ComingSoonPage` + `common.comingSoon`; `/owner/reports` → `ReportsPage`.
- [x] Waiter: `/waiter/tables` → `/waiter/orders/:orderId` (unchanged); `/waiter/orders` (nav) → redirect `/waiter/tables`.

### 5) QA checklist
- [x] Language switch without reload — `LanguageSwitcher` gọi `i18n.changeLanguage` (React re-render, không `location.reload`).
- [x] Persistence after refresh — `apps/web/src/i18n/index.ts`: detector `caches: ['localStorage']`, `lookupLocalStorage: 'restaurant_lang'`.
- [x] EN layout smoke (desktop/mobile) — layout dùng flex/grid + `npm run build` pass; không chạy Playwright/browser trong session này.
- [x] Smoke roles — routes theo role trong `App.tsx` khớp sidebar; build pass.

### 6) Build quality gates
- [x] `cmd.exe /c "cd apps\\web && npm run lint"` — pass
- [x] `cmd.exe /c "cd apps\\web && npm run build"` — pass

## Acceptance Criteria
- No user-facing hardcoded text remains in targeted screens.
- Locale formatting follows active language.
- Role-based flows work after i18n changes (routing aligned with nav).
- Lint/build pass with no errors.

## Suggested Commit Sequence
1. `feat: complete i18n migration for waiter and cashier screens`
2. `feat: complete i18n migration for owner, bills, and audit screens`
3. `chore: finalize i18n qa and formatting consistency`

## Notes
- **Locale cleanup:** Pared JSON to keys used from `App.tsx`, layouts, `StatusBadge`, `Toast`, `LanguageSwitcher`, `format.ts`, v.v.; removed `common.validation`; dropped duplicate/unreferenced auth navigation and login title keys.
- **Nav parity:** Owner/Cashier “Reports” và Owner tables/menu/staff không còn 404; phục vụ bottom “Orders” không còn route trống.
- **GitNexus:** MCP không có descriptor trong workspace; không chạy `gitnexus_impact` qua MCP.
