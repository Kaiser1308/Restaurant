namespace Restaurant.Api.Domain.Entities;

public sealed class BillNumberSequence
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public DateOnly Date { get; set; }
    public int LastSequence { get; set; }

    public Tenant Tenant { get; set; } = null!;
}
