using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Restaurant.Api.DTOs.AuditLogs;
using Restaurant.Api.DTOs.Common;
using Restaurant.Api.Services;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/audit-logs")]
[Authorize(Policy = "OwnerOrManager")]
public sealed class AuditLogsController(IAuditLogService auditLogService) : ControllerBase
{
    [HttpGet]
    public Task<PagedResponse<AuditLogResponse>> List(
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] string? action,
        [FromQuery] string? entityType,
        [FromQuery] Guid? userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken cancellationToken = default)
        => auditLogService.ListAsync(from, to, action, entityType, userId, page, pageSize, cancellationToken);
}
