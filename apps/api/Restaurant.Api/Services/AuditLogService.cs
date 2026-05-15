using Restaurant.Api.DTOs.AuditLogs;
using Restaurant.Api.DTOs.Common;
using Restaurant.Api.Repositories;

namespace Restaurant.Api.Services;

public sealed class AuditLogService(IAuditLogRepository auditLogRepository) : IAuditLogService
{
    public async Task<PagedResponse<AuditLogResponse>> ListAsync(
        DateTimeOffset? from,
        DateTimeOffset? to,
        string? action,
        string? entityType,
        Guid? userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var (items, totalCount) = await auditLogRepository.ListAsync(from, to, action, entityType, userId, page, pageSize, cancellationToken);

        return new PagedResponse<AuditLogResponse>(
            items.Select(x => new AuditLogResponse(
                    x.Id,
                    x.UserId,
                    x.User?.Name,
                    x.Action,
                    x.EntityType,
                    x.EntityId,
                    x.Reason,
                    x.CreatedAt))
                .ToList(),
            page,
            pageSize,
            totalCount);
    }
}
