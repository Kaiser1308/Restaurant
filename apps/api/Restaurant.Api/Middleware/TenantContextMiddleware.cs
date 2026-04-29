using System.Security.Claims;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.Infrastructure.Auth;

namespace Restaurant.Api.Middleware;

public sealed class TenantContextMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext httpContext, ITenantContext tenantContext)
    {
        if (httpContext.User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var tenantIdClaim = httpContext.User.FindFirstValue("tenant_id");
            var roleClaim = httpContext.User.FindFirstValue(ClaimTypes.Role)
                ?? httpContext.User.FindFirstValue("role");

            var hasUserId = Guid.TryParse(userIdClaim, out var userId);
            var hasTenantId = Guid.TryParse(tenantIdClaim, out var tenantId);
            var hasRole = Enum.TryParse<UserRole>(roleClaim, true, out var role);

            tenantContext.Set(
                hasUserId ? userId : null,
                hasTenantId ? tenantId : null,
                hasRole ? role : null,
                hasUserId && hasTenantId && hasRole);
        }
        else
        {
            tenantContext.Set(null, null, null, false);
        }

        await next(httpContext);
    }
}
