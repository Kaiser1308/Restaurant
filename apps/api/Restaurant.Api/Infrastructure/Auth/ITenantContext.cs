using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Infrastructure.Auth;

public interface ITenantContext
{
    Guid? UserId { get; }
    Guid? TenantId { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }
    Guid RequireTenantId();
    Guid RequireUserId();
    UserRole RequireRole();
    void Set(Guid? userId, Guid? tenantId, UserRole? role, bool isAuthenticated);
}
