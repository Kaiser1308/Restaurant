# Tenant Context Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate fail-open tenant/user fallbacks in API business-write paths so authenticated requests fail fast instead of writing `Guid.Empty` into multi-tenant data.

**Architecture:** Keep the current `Controller -> Service -> Repository` shape intact. Add a small required-context API to `ITenantContext`/`TenantContext`, then migrate service write paths to consume it incrementally without changing unrelated business logic.

**Tech Stack:** ASP.NET Core .NET 9, EF Core, FluentValidation, custom `BusinessException` hierarchy.

---

## File Structure

**Modify**
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Infrastructure\Auth\ITenantContext.cs`
  Responsibility: expose required-context accessors for tenant/user/role.
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Infrastructure\Auth\TenantContext.cs`
  Responsibility: implement fail-fast accessors on top of the current nullable stored values.
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\OrderService.cs`
  Responsibility: remove `Guid.Empty` fallbacks from create/add-item/audit paths.
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\TableService.cs`
  Responsibility: remove `Guid.Empty` fallback from table creation.
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\CategoryService.cs`
  Responsibility: remove `Guid.Empty` fallback from category creation.
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\MenuItemService.cs`
  Responsibility: remove `Guid.Empty` fallback from menu-item create/upload paths.
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\BillService.cs`
  Responsibility: remove remaining `Guid.Empty` fallback from audit-log creation.

**Verify**
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Middleware\TenantContextMiddleware.cs`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Program.cs`
- `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Common\Exceptions\Exceptions.cs`

---

### Task 1: Add required accessors to tenant context

**Files:**
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Infrastructure\Auth\ITenantContext.cs`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Infrastructure\Auth\TenantContext.cs`
- Verify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Common\Exceptions\Exceptions.cs`

- [ ] **Step 1: Add required members to `ITenantContext`**

```csharp
using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Infrastructure.Auth;

public interface ITenantContext
{
    Guid? UserId { get; }
    Guid? TenantId { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }

    Guid RequireUserId();
    Guid RequireTenantId();
    UserRole RequireRole();

    void Set(Guid? userId, Guid? tenantId, UserRole? role, bool isAuthenticated);
}
```

- [ ] **Step 2: Run build to verify interface breakage appears where expected**

Run: `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`
Expected: FAIL because `TenantContext` does not yet implement the new members.

- [ ] **Step 3: Implement the required accessors in `TenantContext`**

```csharp
using Restaurant.Api.Common.Exceptions;
using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Infrastructure.Auth;

public sealed class TenantContext : ITenantContext
{
    public Guid? UserId { get; private set; }
    public Guid? TenantId { get; private set; }
    public UserRole? Role { get; private set; }
    public bool IsAuthenticated { get; private set; }

    public Guid RequireUserId()
        => UserId ?? throw new UnauthorizedException("Authenticated user context is missing.");

    public Guid RequireTenantId()
        => TenantId ?? throw new UnauthorizedException("Authenticated tenant context is missing.");

    public UserRole RequireRole()
        => Role ?? throw new UnauthorizedException("Authenticated role context is missing.");

    public void Set(Guid? userId, Guid? tenantId, UserRole? role, bool isAuthenticated)
    {
        UserId = userId;
        TenantId = tenantId;
        Role = role;
        IsAuthenticated = isAuthenticated;
    }
}
```

- [ ] **Step 4: Run build to verify the new accessors compile**

Run: `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`
Expected: PASS or FAIL only in service files still using old fallback patterns.

- [ ] **Step 5: Commit**

```bash
git add apps/api/Restaurant.Api/Infrastructure/Auth/ITenantContext.cs apps/api/Restaurant.Api/Infrastructure/Auth/TenantContext.cs
git commit -m "refactor: add required tenant context accessors"
```

### Task 2: Migrate table and category create paths

**Files:**
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\TableService.cs`
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\CategoryService.cs`

- [ ] **Step 1: Replace table create fallback with required tenant access**

```csharp
var table = new RestaurantTable
{
    Id = Guid.NewGuid(),
    TenantId = tenantContext.RequireTenantId(),
    Name = request.Name.Trim(),
    Status = TableStatus.Available,
    CreatedAt = DateTimeOffset.UtcNow,
    UpdatedAt = DateTimeOffset.UtcNow
};
```

- [ ] **Step 2: Replace category create fallback with required tenant access**

```csharp
var category = new Category
{
    Id = Guid.NewGuid(),
    TenantId = tenantContext.RequireTenantId(),
    Name = request.Name.Trim(),
    SortOrder = request.SortOrder,
    IsActive = true,
    CreatedAt = DateTimeOffset.UtcNow,
    UpdatedAt = DateTimeOffset.UtcNow
};
```

- [ ] **Step 3: Run build to verify these two services still compile**

Run: `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`
Expected: PASS or FAIL only in remaining services still using `Guid.Empty` fallback.

- [ ] **Step 4: Commit**

```bash
git add apps/api/Restaurant.Api/Services/TableService.cs apps/api/Restaurant.Api/Services/CategoryService.cs
git commit -m "refactor: require tenant context for table and category writes"
```

### Task 3: Migrate order service write and audit paths

**Files:**
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\OrderService.cs`

- [ ] **Step 1: Introduce local required context variables at the top of write methods**

Use this pattern in `CreateAsync` and `AddItemAsync`:

```csharp
var tenantId = tenantContext.RequireTenantId();
var userId = tenantContext.RequireUserId();
var now = DateTimeOffset.UtcNow;
```

- [ ] **Step 2: Replace entity writes that currently use fallback IDs**

```csharp
var order = new Order
{
    Id = Guid.NewGuid(),
    TenantId = tenantId,
    TableId = table.Id,
    CreatedByUserId = userId,
    Status = OrderStatus.Pending,
    CreatedAt = now,
    UpdatedAt = now
};
```

```csharp
var item = new OrderItem
{
    Id = Guid.NewGuid(),
    TenantId = tenantId,
    OrderId = order.Id,
    MenuItemId = menuItem.Id,
    ItemNameSnapshot = menuItem.Name,
    Quantity = request.Quantity,
    UnitPrice = menuItem.Price,
    Status = OrderItemStatus.Pending,
    CreatedAt = now,
    UpdatedAt = now
};
```

- [ ] **Step 3: Make `AddAuditAsync` fail fast instead of writing fake tenant/user IDs**

```csharp
private async Task AddAuditAsync(string action, string entityType, Guid entityId, string? reason, CancellationToken cancellationToken)
{
    var log = new AuditLog
    {
        Id = Guid.NewGuid(),
        TenantId = tenantContext.RequireTenantId(),
        UserId = tenantContext.RequireUserId(),
        Action = action,
        EntityType = entityType,
        EntityId = entityId,
        Reason = reason,
        CreatedAt = DateTimeOffset.UtcNow
    };

    await orderRepository.AddAuditLogAsync(log, cancellationToken);
}
```

- [ ] **Step 4: Run build to verify `OrderService` compiles cleanly**

Run: `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`
Expected: PASS or FAIL only in `MenuItemService` / `BillService` remaining fallback sites.

- [ ] **Step 5: Commit**

```bash
git add apps/api/Restaurant.Api/Services/OrderService.cs
git commit -m "refactor: require tenant context for order writes"
```

### Task 4: Migrate menu item write paths

**Files:**
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\MenuItemService.cs`

- [ ] **Step 1: Replace create-path fallback with required tenant access**

```csharp
var item = new MenuItem
{
    Id = Guid.NewGuid(),
    TenantId = tenantContext.RequireTenantId(),
    CategoryId = request.CategoryId,
    Name = request.Name.Trim(),
    Price = request.Price,
    Description = request.Description?.Trim(),
    IsAvailable = request.IsAvailable,
    IsActive = true,
    CreatedAt = DateTimeOffset.UtcNow,
    UpdatedAt = DateTimeOffset.UtcNow
};
```

- [ ] **Step 2: Replace upload-image fallback with required tenant access**

```csharp
var tenantId = tenantContext.RequireTenantId();
var oldObjectKey = item.ImageObjectKey;
var extension = GetFileExtension(image.ContentType);
var objectKey = $"tenants/{tenantId}/menu-items/{item.Id}/{Guid.NewGuid():N}{extension}";
```

- [ ] **Step 3: Keep non-write read logic unchanged**

Do not change:
- `QueryAsync`
- `MapAsync`
- image content validation

- [ ] **Step 4: Run build to verify `MenuItemService` compiles cleanly**

Run: `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`
Expected: PASS or FAIL only in the remaining `BillService` fallback site.

- [ ] **Step 5: Commit**

```bash
git add apps/api/Restaurant.Api/Services/MenuItemService.cs
git commit -m "refactor: require tenant context for menu item writes"
```

### Task 5: Migrate remaining bill audit fallback

**Files:**
- Modify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Services\BillService.cs`

- [ ] **Step 1: Keep existing `PayOrderAsync` and `VoidAsync` required-context usage as the model**

Do not change these existing lines except for consistency review:

```csharp
var tenantId = tenantContext.TenantId ?? throw new UnauthorizedException();
var userId = tenantContext.UserId ?? throw new UnauthorizedException();
var role = tenantContext.Role ?? throw new UnauthorizedException();
```

- [ ] **Step 2: Replace the remaining audit fallback in `AddAuditAsync`**

```csharp
private async Task AddAuditAsync(string action, string entityType, Guid entityId, string? reason, CancellationToken cancellationToken)
{
    var log = new AuditLog
    {
        Id = Guid.NewGuid(),
        TenantId = tenantContext.RequireTenantId(),
        UserId = tenantContext.RequireUserId(),
        Action = action,
        EntityType = entityType,
        EntityId = entityId,
        Reason = reason,
        CreatedAt = DateTimeOffset.UtcNow
    };

    await auditLogRepository.AddAsync(log, cancellationToken);
}
```

- [ ] **Step 3: Optionally normalize existing direct null-coalescing checks to the new accessor API**

Optional follow-up cleanup in the same file if desired:

```csharp
var tenantId = tenantContext.RequireTenantId();
var userId = tenantContext.RequireUserId();
var role = tenantContext.RequireRole();
```

This is safe to do now, but not required for the minimum hardening goal.

- [ ] **Step 4: Run build to verify all `Guid.Empty` fallback sites are gone**

Run: `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/Restaurant.Api/Services/BillService.cs
git commit -m "refactor: remove remaining bill audit tenant fallback"
```

### Task 6: Verify behavior and regression surface

**Files:**
- Verify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Program.cs`
- Verify: `C:\Users\THIEN\Desktop\PersonalProject\Restaurant\apps\api\Restaurant.Api\Middleware\TenantContextMiddleware.cs`
- Verify: all services touched above

- [ ] **Step 1: Confirm no `Guid.Empty` tenant fallback remains in API source**

Run:

```powershell
Get-ChildItem 'apps\api\Restaurant.Api' -Recurse -Filter *.cs |
  Select-String -Pattern 'Guid\.Empty' |
  ForEach-Object { '{0}:{1}:{2}' -f $_.Path, $_.LineNumber, $_.Line.Trim() }
```

Expected: no service-layer business-write fallback results.

- [ ] **Step 2: Rebuild the API**

Run: `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`
Expected: `Build succeeded.`

- [ ] **Step 3: Start the API and smoke-test authenticated write endpoints**

Run: `cmd.exe /c "dotnet run --project apps\api\Restaurant.Api"`

Manual checks:
- login still works
- create table still works with valid token
- create category still works with valid token
- create order still works with valid token
- upload menu item image still works with valid token
- pay bill / void bill still work with valid token

Expected: all valid authenticated flows still succeed.

- [ ] **Step 4: Negative smoke-test missing/invalid auth context**

Manual checks:
- call a protected write endpoint without token
- call a protected write endpoint with malformed token lacking tenant/user claims if you can reproduce locally

Expected:
- request fails with `401`
- no new business rows are written with `00000000-0000-0000-0000-000000000000`

- [ ] **Step 5: Commit final verification notes if code changed during cleanup**

```bash
git status
```

Expected: clean working tree, or only intentional changes.

## Self-Review

Spec coverage:
- required-context API added: Task 1
- service write-path migration: Tasks 2-5
- verification and no-fallback scan: Task 6

Placeholder scan:
- no TBD/TODO markers left
- every modified file path is explicit
- every verification command is explicit

Type consistency:
- `RequireUserId`, `RequireTenantId`, `RequireRole` are the only new accessor names used across tasks
- exception type remains `UnauthorizedException`

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-01-tenant-context-hardening.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
