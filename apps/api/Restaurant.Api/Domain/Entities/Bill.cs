using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Domain.Entities;

public sealed class Bill
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid OrderId { get; set; }
    public string BillNumber { get; set; } = string.Empty;
    public BillStatus Status { get; set; } = BillStatus.Paid;
    public PaymentType PaymentType { get; set; } = PaymentType.Cash;
    public decimal TotalAmount { get; set; }
    public Guid PaidByUserId { get; set; }
    public DateTimeOffset PaidAt { get; set; }
    public DateTimeOffset? VoidedAt { get; set; }
    public Guid? VoidedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Tenant Tenant { get; set; } = null!;
    public Order Order { get; set; } = null!;
    public User PaidByUser { get; set; } = null!;
    public User? VoidedByUser { get; set; }
    public ICollection<BillItem> Items { get; set; } = new List<BillItem>();
    public ICollection<VoidLog> VoidLogs { get; set; } = new List<VoidLog>();
}
