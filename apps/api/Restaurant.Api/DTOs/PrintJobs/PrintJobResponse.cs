namespace Restaurant.Api.DTOs.PrintJobs;

public sealed record PrintJobResponse(
    Guid Id,
    Guid TenantId,
    string EntityType,
    Guid EntityId,
    string PrinterType,
    string PrintKey,
    string Status,
    string ContentJson,
    string? ErrorMessage,
    int RetryCount,
    DateTimeOffset? PrintedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
