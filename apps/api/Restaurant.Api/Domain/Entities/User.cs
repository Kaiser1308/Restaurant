using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Domain.Entities;

public sealed class User
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Waiter;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Tenant Tenant { get; set; } = null!;
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<Order> CreatedOrders { get; set; } = new List<Order>();
    public ICollection<OrderItem> CancelledOrderItems { get; set; } = new List<OrderItem>();
    public ICollection<Bill> PaidBills { get; set; } = new List<Bill>();
    public ICollection<Bill> VoidedBills { get; set; } = new List<Bill>();
    public ICollection<VoidLog> VoidLogs { get; set; } = new List<VoidLog>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
