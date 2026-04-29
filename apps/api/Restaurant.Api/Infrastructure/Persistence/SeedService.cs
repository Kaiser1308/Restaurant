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
    }
}
