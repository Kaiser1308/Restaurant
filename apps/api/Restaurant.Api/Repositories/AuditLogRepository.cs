using Microsoft.EntityFrameworkCore;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Infrastructure.Persistence;

namespace Restaurant.Api.Repositories;

public sealed class AuditLogRepository(RestaurantDbContext dbContext) : IAuditLogRepository
{
    public Task AddAsync(AuditLog log, CancellationToken cancellationToken = default)
        => dbContext.AuditLogs.AddAsync(log, cancellationToken).AsTask();

    public async Task<(IReadOnlyList<AuditLog> Items, int TotalCount)> ListAsync(
        DateTimeOffset? from,
        DateTimeOffset? to,
        string? action,
        string? entityType,
        Guid? userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.AuditLogs
            .Include(x => x.User)
            .AsQueryable();

        if (from is not null)
        {
            query = query.Where(x => x.CreatedAt >= from);
        }

        if (to is not null)
        {
            query = query.Where(x => x.CreatedAt <= to);
        }

        if (!string.IsNullOrWhiteSpace(action))
        {
            query = query.Where(x => x.Action == action);
        }

        if (!string.IsNullOrWhiteSpace(entityType))
        {
            query = query.Where(x => x.EntityType == entityType);
        }

        if (userId is not null)
        {
            query = query.Where(x => x.UserId == userId);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => dbContext.SaveChangesAsync(cancellationToken);
}
