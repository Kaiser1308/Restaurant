using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Domain.Entities;

public sealed class Tenant
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public TenantStatus Status { get; set; } = TenantStatus.Active;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<RestaurantTable> RestaurantTables { get; set; } = new List<RestaurantTable>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<Bill> Bills { get; set; } = new List<Bill>();
    public ICollection<BillItem> BillItems { get; set; } = new List<BillItem>();
    public ICollection<VoidLog> VoidLogs { get; set; } = new List<VoidLog>();
    public ICollection<BillNumberSequence> BillNumberSequences { get; set; } = new List<BillNumberSequence>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
