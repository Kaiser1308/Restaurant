namespace Restaurant.Api.DTOs.PrintJobs;

public sealed record PrintJobStatusResponse(
    Guid Id,
    string EntityType,
    Guid EntityId,
    string PrinterType,
    string Status,
    string? ErrorMessage,
    int RetryCount,
    DateTimeOffset? PrintedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
