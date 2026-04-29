using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Infrastructure.Auth;

public sealed class TenantContext : ITenantContext
{
    public Guid? UserId { get; private set; }
    public Guid? TenantId { get; private set; }
    public UserRole? Role { get; private set; }
    public bool IsAuthenticated { get; private set; }

    public void Set(Guid? userId, Guid? tenantId, UserRole? role, bool isAuthenticated)
    {
        UserId = userId;
        TenantId = tenantId;
        Role = role;
        IsAuthenticated = isAuthenticated;
    }
}
