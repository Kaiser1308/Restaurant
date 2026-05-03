using Restaurant.Api.Domain.Enums;
using Restaurant.Api.Infrastructure.Auth;

namespace Restaurant.Api.Services;

public sealed class PermissionService : IPermissionService
{
    public bool CanVoidBill(UserRole userRole)
    {
        return userRole == UserRole.Owner;
    }

    public bool CanManageMenu(UserRole userRole)
    {
        return RoleAccess.IsAtLeast(userRole, UserRole.Manager);
    }

    public bool CanManageTables(UserRole userRole)
    {
        return RoleAccess.IsAtLeast(userRole, UserRole.Manager);
    }
}
