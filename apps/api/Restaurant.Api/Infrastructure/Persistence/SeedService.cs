using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Infrastructure.Persistence;

public sealed class SeedService(RestaurantDbContext dbContext, ILogger<SeedService> logger)
{
    private const string DefaultTenantName = "Default Restaurant";
    private const string DefaultOwnerUsername = "owner";
    private const string DefaultOwnerName = "Owner";
    private const string DefaultOwnerPassword = "owner123";
    private const string DefaultWaiterUsername = "waiter";
    private const string DefaultWaiterName = "Waiter";
    private const string DefaultWaiterPassword = "waiter123";
    private static readonly string[] DefaultTableNames = ["Table 1", "Table 2"];

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var tenant = await dbContext.Tenants
            .FirstOrDefaultAsync(x => x.Name == DefaultTenantName, cancellationToken);

        if (tenant is null)
        {
            tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = DefaultTenantName,
                Status = TenantStatus.Active,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            dbContext.Tenants.Add(tenant);
            await dbContext.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Created default tenant: {TenantName}", DefaultTenantName);
        }

        var owner = await dbContext.Users
            .FirstOrDefaultAsync(
                x => x.TenantId == tenant.Id && x.Username == DefaultOwnerUsername,
                cancellationToken);

        if (owner is null)
        {
            var hasher = new PasswordHasher<User>();
            owner = new User
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                Name = DefaultOwnerName,
                Username = DefaultOwnerUsername,
                Role = UserRole.Owner,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            owner.PasswordHash = hasher.HashPassword(owner, DefaultOwnerPassword);

            dbContext.Users.Add(owner);
            await dbContext.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Created default owner user: {Username}", DefaultOwnerUsername);
        }

        var waiter = await dbContext.Users
            .FirstOrDefaultAsync(
                x => x.TenantId == tenant.Id && x.Username == DefaultWaiterUsername,
                cancellationToken);

        if (waiter is null)
        {
            var hasher = new PasswordHasher<User>();
            waiter = new User
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                Name = DefaultWaiterName,
                Username = DefaultWaiterUsername,
                Role = UserRole.Waiter,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            waiter.PasswordHash = hasher.HashPassword(waiter, DefaultWaiterPassword);

            dbContext.Users.Add(waiter);
            await dbContext.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Created default waiter user: {Username}", DefaultWaiterUsername);
        }

        foreach (var tableName in DefaultTableNames)
        {
            var existedTable = await dbContext.RestaurantTables
                .FirstOrDefaultAsync(x => x.TenantId == tenant.Id && x.Name == tableName, cancellationToken);
            if (existedTable is not null)
            {
                continue;
            }

            dbContext.RestaurantTables.Add(new RestaurantTable
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                Name = tableName,
                Status = TableStatus.Available,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            });
        }

        var defaultCategory = await dbContext.Categories
            .FirstOrDefaultAsync(x => x.TenantId == tenant.Id && x.Name == "Mains", cancellationToken);
        if (defaultCategory is null)
        {
            defaultCategory = new Category
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                Name = "Mains",
                SortOrder = 1,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            dbContext.Categories.Add(defaultCategory);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var defaultMenuItems = new (string Name, decimal Price, string? Description)[]
        {
            ("Beef Noodle", 50000m, "Phở bò"),
            ("Iced Tea", 10000m, "Trà đá")
        };

        foreach (var item in defaultMenuItems)
        {
            var existedItem = await dbContext.MenuItems
                .FirstOrDefaultAsync(x => x.TenantId == tenant.Id && x.Name == item.Name, cancellationToken);
            if (existedItem is not null)
            {
                continue;
            }

            dbContext.MenuItems.Add(new MenuItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                CategoryId = defaultCategory.Id,
                Name = item.Name,
                Price = item.Price,
                Description = item.Description,
                IsAvailable = true,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
