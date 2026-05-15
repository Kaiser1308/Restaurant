# Tenant Context Consistency Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalize the remaining business-write tenant/user/role access patterns in `BillService` and `OrderService` so they consistently use `Require*()` helpers instead of direct nullable-property access.

**Architecture:** This is a follow-up cleanup after the first tenant-context-hardening workstream. The scope is intentionally narrow: standardize remaining write-path context reads in two services without changing exception taxonomy, controller contracts, repository contracts, or broader business logic.

**Tech Stack:** ASP.NET Core .NET 9, EF Core, custom auth context helpers, service-layer business logic.

---

## File Structure

**Modify**
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\.worktrees\codex-refactor-tenant-context-hardening\apps\api\Restaurant.Api\Services\BillService.cs`
  Responsibility: normalize remaining direct nullable `tenantContext` property reads in bill write flows.
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\.worktrees\codex-refactor-tenant-context-hardening\apps\api\Restaurant.Api\Services\OrderService.cs`
  Responsibility: normalize the remaining direct nullable `tenantContext.UserId` access in cancel-item write flow.

**Verify**
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\.worktrees\codex-refactor-tenant-context-hardening\apps\api\Restaurant.Api\Infrastructure\Auth\ITenantContext.cs`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\.worktrees\codex-refactor-tenant-context-hardening\apps\api\Restaurant.Api\Infrastructure\Auth\TenantContext.cs`

---

### Task 1: Normalize BillService write-path context access

**Files:**
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\.worktrees\codex-refactor-tenant-context-hardening\apps\api\Restaurant.Api\Services\BillService.cs`

- [ ] **Step 1: Replace direct nullable access in `PayOrderAsync`**

Change this pattern:

```csharp
var tenantId = tenantContext.TenantId ?? throw new UnauthorizedException();
var userId = tenantContext.UserId ?? throw new UnauthorizedException();
```

To:

```csharp
var tenantId = tenantContext.RequireTenantId();
var userId = tenantContext.RequireUserId();
```

- [ ] **Step 2: Replace direct nullable access in `VoidAsync`**

Change this pattern:

```csharp
var role = tenantContext.Role ?? throw new UnauthorizedException();
var userId = tenantContext.UserId ?? throw new UnauthorizedException();
```

To:

```csharp
var role = tenantContext.RequireRole();
var userId = tenantContext.RequireUserId();
```

- [ ] **Step 3: Normalize `AddAuditAsync` to the same helper API**

Change this pattern:

```csharp
var tenantId = tenantContext.TenantId ?? throw new UnauthorizedException();
var userId = tenantContext.UserId ?? throw new UnauthorizedException();
```

To:

```csharp
var tenantId = tenantContext.RequireTenantId();
var userId = tenantContext.RequireUserId();
```

- [ ] **Step 4: Run build**

Run: `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`
Expected: `Build succeeded.`

- [ ] **Step 5: Commit**

```bash
git add apps/api/Restaurant.Api/Services/BillService.cs
git commit -m "refactor: normalize bill service tenant context access"
```

### Task 2: Normalize OrderService cancel-item write path

**Files:**
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\.worktrees\codex-refactor-tenant-context-hardening\apps\api\Restaurant.Api\Services\OrderService.cs`

- [ ] **Step 1: Replace nullable user assignment in `CancelItemAsync`**

Change this line:

```csharp
item.CancelledByUserId = tenantContext.UserId;
```

To:

```csharp
item.CancelledByUserId = tenantContext.RequireUserId();
```

- [ ] **Step 2: Keep surrounding cancellation logic unchanged**

Do not change:
- conflict checks
- reason trimming
- timestamps
- audit call
- repository calls

- [ ] **Step 3: Run build**

Run: `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`
Expected: `Build succeeded.`

- [ ] **Step 4: Commit**

```bash
git add apps/api/Restaurant.Api/Services/OrderService.cs
git commit -m "refactor: normalize order cancellation user context access"
```

### Task 3: Final verification for consistency goal

**Files:**
- Verify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\.worktrees\codex-refactor-tenant-context-hardening\apps\api\Restaurant.Api\Services\BillService.cs`
- Verify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\.worktrees\codex-refactor-tenant-context-hardening\apps\api\Restaurant.Api\Services\OrderService.cs`

- [ ] **Step 1: Search for remaining direct nullable business-write accesses**

Run:

```powershell
Get-ChildItem 'apps\api\Restaurant.Api\Services' -Filter *.cs |
  Select-String -Pattern 'tenantContext\.(TenantId|UserId|Role)' |
  ForEach-Object { '{0}:{1}:{2}' -f $_.Path, $_.LineNumber, $_.Line.Trim() }
```

Expected:
- no remaining business-write call sites in `BillService.cs`
- no remaining business-write nullable user assignment in `OrderService.cs`
- any remaining matches should be reviewed and either accepted as read-only or treated as new cleanup scope

- [ ] **Step 2: Rebuild API**

Run: `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`
Expected: `Build succeeded.`

- [ ] **Step 3: Optional smoke-check target flows**

Manual target flows:
- pay order
- void bill
- cancel order item

Expected:
- valid authenticated flows still succeed
- missing/invalid auth context now fails through `Require*` consistently

- [ ] **Step 4: Check changed-file scope**

Run:

```bash
git status --short
```

Expected changed files for this mini-workstream:
- `apps/api/Restaurant.Api/Services/BillService.cs`
- `apps/api/Restaurant.Api/Services/OrderService.cs`

## Self-Review

Spec coverage:
- remaining BillService nullable context access: Task 1
- remaining OrderService cancel-item nullable user access: Task 2
- consistency verification: Task 3

Placeholder scan:
- no TBD/TODO markers
- exact file paths included
- exact commands included

Type consistency:
- use only `RequireTenantId()`, `RequireUserId()`, `RequireRole()`
- do not introduce new exception types or helper names in this mini-workstream

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-01-tenant-context-consistency-cleanup.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
