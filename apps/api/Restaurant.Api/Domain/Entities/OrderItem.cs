using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Domain.Entities;

public sealed class OrderItem
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid OrderId { get; set; }
    public Guid MenuItemId { get; set; }
    public string ItemNameSnapshot { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public OrderItemStatus Status { get; set; } = OrderItemStatus.Pending;
    public string? CancelReason { get; set; }
    public Guid? CancelledByUserId { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }
    public DateTimeOffset? SentToKitchenAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Tenant Tenant { get; set; } = null!;
    public Order Order { get; set; } = null!;
    public MenuItem MenuItem { get; set; } = null!;
    public User? CancelledByUser { get; set; }
    public ICollection<BillItem> BillItems { get; set; } = new List<BillItem>();
}
