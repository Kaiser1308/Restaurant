# GitNexus C# Symbol Resolution Bug Report

## Summary
- GitNexus MCP symbol-level lookup fails for C# symbols in repo `Restaurant`.
- `analyze --force` and normal `analyze` fail during `scopeResolution` after scope extraction errors.
- Failure persists after clean index rebuild.

## Environment
- OS: Windows 10.0.26200
- Repo: `Restaurant`
- Commit: `71a53045707fba4625086653b323f7d96d4f98f9`
- `npx gitnexus --version`: `1.6.3`
- `node -v`: `v22.22.0`
- `npm -v`: `11.12.1`

## Repro Steps and Results

### 1) MCP symbol checks (before clean rebuild)
Commands/tools:
- MCP `impact` with `target="ITenantContext"`, `direction="upstream"`, `repo="Restaurant"`
- MCP `context` with `name="TableService"`, `repo="Restaurant"`

Actual:
- `Target 'ITenantContext' not found`
- `Symbol 'TableService' not found`

Expected:
- Both symbols should resolve and return upstream dependents/context for C# code.

### 2) Analyze-force repro
Command:
- `npx gitnexus analyze --force`

Actual:
- `scope extraction failed for .../20260501124955_AddMenuItemImage.Designer.cs: Invalid argument`
- `scope extraction failed for .../RestaurantDbContextModelSnapshot.cs: Invalid argument`
- `scope extraction failed for .../20260429132152_AddBillsAndPayments.Designer.cs: Invalid argument`
- `Analysis failed: Phase 'scopeResolution' failed: Cannot add property 1, object is not extensible`

Expected:
- Analysis completes successfully; C# symbols are indexed and queryable via MCP symbol tools.

### 3) Clean rebuild validation
Commands:
- `npx gitnexus clean --force`
- `npx gitnexus analyze`
- Repeat MCP checks above

Actual:
- Clean succeeds (`Deleted: ...\.gitnexus`)
- `npx gitnexus analyze` fails with the same scope extraction + `scopeResolution` error
- Repeated MCP checks still fail:
  - `Target 'ITenantContext' not found`
  - `Symbol 'TableService' not found`

Expected:
- Clean rebuild should recover index and make C# symbols resolvable.

## Actual vs Expected (Concise)
- Actual: C# symbol-level MCP queries fail and analyzer crashes in `scopeResolution`.
- Expected: Analyzer finishes and MCP `impact/context` resolve C# symbols in `Restaurant`.

