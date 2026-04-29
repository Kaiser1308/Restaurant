using Microsoft.EntityFrameworkCore;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.Infrastructure.Persistence;

namespace Restaurant.Api.Repositories;

public sealed class AuthRepository(RestaurantDbContext dbContext) : IAuthRepository
{
    public Task<User?> GetUserByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        return dbContext.Users
            .Include(x => x.Tenant)
            .FirstOrDefaultAsync(
                x => x.Username == username && x.Tenant.Status == TenantStatus.Active,
                cancellationToken);
    }

    public Task<User?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return dbContext.Users
            .Include(x => x.Tenant)
            .FirstOrDefaultAsync(
                x => x.Id == userId && x.Tenant.Status == TenantStatus.Active,
                cancellationToken);
    }

    public Task<RefreshToken?> GetRefreshTokenByHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        return dbContext.RefreshTokens
            .Include(x => x.User)
            .ThenInclude(x => x.Tenant)
            .FirstOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);
    }

    public async Task AddRefreshTokenAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        await dbContext.RefreshTokens.AddAsync(refreshToken, cancellationToken);
    }

    public async Task RevokeActiveRefreshTokensForUserAsync(
        Guid userId,
        DateTimeOffset revokedAt,
        CancellationToken cancellationToken = default)
    {
        var activeTokens = await dbContext.RefreshTokens
            .Where(x => x.UserId == userId && x.RevokedAt == null && x.ExpiresAt > revokedAt)
            .ToListAsync(cancellationToken);

        foreach (var token in activeTokens)
        {
            token.RevokedAt = revokedAt;
        }
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
