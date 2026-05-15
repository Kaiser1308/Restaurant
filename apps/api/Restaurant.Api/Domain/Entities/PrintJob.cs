using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Domain.Entities;

public sealed class PrintJob
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public PrinterType PrinterType { get; set; }
    public string PrintKey { get; set; } = string.Empty;
    public PrintJobStatus Status { get; set; } = PrintJobStatus.Pending;
    public string ContentJson { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public int RetryCount { get; set; }
    public DateTimeOffset? PrintedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Tenant Tenant { get; set; } = null!;
}
