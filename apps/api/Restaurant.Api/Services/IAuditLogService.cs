using Restaurant.Api.DTOs.AuditLogs;
using Restaurant.Api.DTOs.Common;

namespace Restaurant.Api.Services;

public interface IAuditLogService
{
    Task<PagedResponse<AuditLogResponse>> ListAsync(
        DateTimeOffset? from,
        DateTimeOffset? to,
        string? action,
        string? entityType,
        Guid? userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
}
