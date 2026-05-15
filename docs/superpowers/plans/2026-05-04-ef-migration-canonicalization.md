# EF Migration Canonicalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move EF Core migrations into `Infrastructure/Persistence/Migrations/` to match the DbContext namespace, and add defensive error handling around `MigrateAsync()` at startup.

**Architecture:** Single-step migration consolidation. Delete current migrations at `Migrations/`, regenerate in `Infrastructure/Persistence/Migrations/` using `--output-dir`, then wrap Program.cs startup migration in try-catch with Serilog logging.

**Tech Stack:** .NET 9, EF Core 9.0.7, Npgsql, Serilog

---

### Task 1: Regenerate migration in correct directory

**Files:**
- Delete: `apps/api/Restaurant.Api/Migrations/20260504040949_InitialCreate.cs`
- Delete: `apps/api/Restaurant.Api/Migrations/20260504040949_InitialCreate.Designer.cs`
- Delete: `apps/api/Restaurant.Api/Migrations/RestaurantDbContextModelSnapshot.cs`
- Create: `apps/api/Restaurant.Api/Infrastructure/Persistence/Migrations/` (via EF tool)

- [ ] **Step 1: Remove old migration files**

```bash
rm apps/api/Restaurant.Api/Migrations/*.cs
```

- [ ] **Step 2: Drop all DB tables (clean slate for new migration)**

```bash
docker compose exec postgres psql -U restaurant_user -d restaurant_db -c "
DO \$\$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END \$\$;
"
```

- [ ] **Step 3: Generate migration via `dotnet ef` with `--output-dir`**

Run from WSL:
```bash
cmd.exe /c "dotnet ef migrations add InitialCreate --project apps\\api\\Restaurant.Api --output-dir Infrastructure\\Persistence\\Migrations"
```

Expected: "Build started... Build succeeded. Done."

- [ ] **Step 4: Verify files exist and namespace is correct**

Run:
```bash
ls -la apps/api/Restaurant.Api/Infrastructure/Persistence/Migrations/
head -10 apps/api/Restaurant.Api/Infrastructure/Persistence/Migrations/*_InitialCreate.cs
```

Expected output contains 3 files (`InitialCreate.cs`, `InitialCreate.Designer.cs`, `RestaurantDbContextModelSnapshot.cs`) and namespace `Restaurant.Api.Infrastructure.Persistence.Migrations`.

- [ ] **Step 5: Remove empty old migrations directory**

```bash
rmdir apps/api/Restaurant.Api/Migrations/ 2>/dev/null; echo "done"
```

- [ ] **Step 6: Verify build**

```bash
cmd.exe /c "dotnet build apps\\api\\Restaurant.Api\\Restaurant.Api.csproj"
```

Expected: "Build succeeded."

- [ ] **Step 7: Commit**

```bash
git add apps/api/Restaurant.Api/Infrastructure/Persistence/Migrations/
git add apps/api/Restaurant.Api/Migrations/
git commit -m "chore: move ef migrations to Infrastructure/Persistence/Migrations"
```

---

### Task 2: Add error handling around MigrateAsync in Program.cs

**Files:**
- Modify: `apps/api/Restaurant.Api/Program.cs:139-145`

- [ ] **Step 1: Wrap MigrateAsync + SeedAsync in try-catch with Serilog logging**

Replace this block (lines 139-145):
```csharp
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<RestaurantDbContext>();
    var seedService = scope.ServiceProvider.GetRequiredService<SeedService>();
    await dbContext.Database.MigrateAsync();
    await seedService.SeedAsync();
}
```

With:
```csharp
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<RestaurantDbContext>();
    var seedService = scope.ServiceProvider.GetRequiredService<SeedService>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        await dbContext.Database.MigrateAsync();
        await seedService.SeedAsync();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database migration or seeding failed");
        throw;
    }
}
```

- [ ] **Step 2: Build and verify no compile errors**

```bash
cmd.exe /c "dotnet build apps\\api\\Restaurant.Api\\Restaurant.Api.csproj"
```

Expected: "Build succeeded."

- [ ] **Step 3: Commit**

```bash
git add apps/api/Restaurant.Api/Program.cs
git commit -m "fix: add error handling around MigrateAsync in startup"
```

---

### Task 3: End-to-end verification

- [ ] **Step 1: Drop all tables (ensure clean state)**

```bash
docker compose exec postgres psql -U restaurant_user -d restaurant_db -c "
DO \$\$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END \$\$;
"
```

- [ ] **Step 2: Run API and verify migrations apply + seeds run**

```bash
cmd.exe /c "dotnet run --project apps\\api\\Restaurant.Api"
```

Wait for output. Expected:
```
[INF] Created default tenant: Default Restaurant
[INF] Created default owner user: owner
[INF] Created default waiter user: waiter
[INF] Now listening on: http://localhost:5141
[INF] Application started.
```

Press Ctrl+C to stop.

- [ ] **Step 3: Verify database state**

```bash
docker compose exec postgres psql -U restaurant_user -d restaurant_db -c "SELECT migration_id FROM \"__EFMigrationsHistory\";"
```

Expected: 1 row with `InitialCreate`.

```bash
docker compose exec postgres psql -U restaurant_user -d restaurant_db -c "\dt"
```

Expected: 15 tables including `__EFMigrationsHistory`, `tenants`, `users`, `menu_items`, etc.

- [ ] **Step 4: Verify `image_object_key` column exists on `menu_items`**

```bash
docker compose exec postgres psql -U restaurant_user -d restaurant_db -c "\d menu_items" | grep image_object_key
```

Expected: `image_object_key | character varying(500)`

- [ ] **Step 5: Restart API (verify idempotent migrations)**

```bash
cmd.exe /c "dotnet run --project apps\\api\\Restaurant.Api"
```

Expected: No errors, app starts normally. Press Ctrl+C to stop.

- [ ] **Step 6: Commit**

```bash
git commit -m "chore: verify migration canonicalization works end-to-end"
```
