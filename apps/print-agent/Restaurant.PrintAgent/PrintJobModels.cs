namespace Restaurant.PrintAgent;

public class PrintJobResponse
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string PrinterType { get; set; } = string.Empty;
    public string? PrintKey { get; set; }
    public string Status { get; set; } = string.Empty;
    public string ContentJson { get; set; } = "{}";
    public string? ErrorMessage { get; set; }
    public int RetryCount { get; set; }
    public DateTime? PrintedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class MarkPrintJobFailedRequest
{
    public string ErrorMessage { get; set; } = string.Empty;
}
