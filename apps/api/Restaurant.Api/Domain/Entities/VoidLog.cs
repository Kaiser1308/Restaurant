namespace Restaurant.Api.Domain.Entities;

public sealed class VoidLog
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid BillId { get; set; }
    public Guid UserId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }

    public Tenant Tenant { get; set; } = null!;
    public Bill Bill { get; set; } = null!;
    public User User { get; set; } = null!;
}
