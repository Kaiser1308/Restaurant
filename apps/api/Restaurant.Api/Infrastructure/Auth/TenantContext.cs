using Restaurant.Api.Common.Exceptions;
using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Infrastructure.Auth;

public sealed class TenantContext : ITenantContext
{
    public Guid? UserId { get; private set; }
    public Guid? TenantId { get; private set; }
    public UserRole? Role { get; private set; }
    public bool IsAuthenticated { get; private set; }

    public Guid RequireTenantId()
        => TenantId ?? throw new UnauthorizedException();

    public Guid RequireUserId()
        => UserId ?? throw new UnauthorizedException();

    public UserRole RequireRole()
        => Role ?? throw new UnauthorizedException();

    public void Set(Guid? userId, Guid? tenantId, UserRole? role, bool isAuthenticated)
    {
        UserId = userId;
        TenantId = tenantId;
        Role = role;
        IsAuthenticated = isAuthenticated;
    }
}
