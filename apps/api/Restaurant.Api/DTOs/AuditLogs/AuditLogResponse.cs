namespace Restaurant.Api.DTOs.AuditLogs;

public sealed record AuditLogResponse(
    Guid Id,
    Guid? UserId,
    string? UserName,
    string Action,
    string EntityType,
    Guid EntityId,
    string? Reason,
    DateTimeOffset CreatedAt);
