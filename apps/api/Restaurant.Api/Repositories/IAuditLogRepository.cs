using Restaurant.Api.Domain.Entities;

namespace Restaurant.Api.Repositories;

public interface IAuditLogRepository
{
    Task AddAsync(AuditLog log, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<AuditLog> Items, int TotalCount)> ListAsync(
        DateTimeOffset? from,
        DateTimeOffset? to,
        string? action,
        string? entityType,
        Guid? userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
