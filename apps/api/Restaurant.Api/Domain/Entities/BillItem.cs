namespace Restaurant.Api.Domain.Entities;

public sealed class BillItem
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid BillId { get; set; }
    public Guid? OrderItemId { get; set; }
    public string ItemNameSnapshot { get; set; } = string.Empty;
    public decimal UnitPriceSnapshot { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public Tenant Tenant { get; set; } = null!;
    public Bill Bill { get; set; } = null!;
    public OrderItem? OrderItem { get; set; }
}
