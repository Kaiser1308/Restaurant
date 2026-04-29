using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Infrastructure.Auth;

public static class RoleAccess
{
    public static int GetLevel(UserRole role) => role switch
    {
        UserRole.Owner => 4,
        UserRole.Manager => 3,
        UserRole.Cashier => 2,
        UserRole.Waiter => 1,
        _ => 0
    };

    public static bool IsAtLeast(UserRole role, UserRole minimumRole)
    {
        return GetLevel(role) >= GetLevel(minimumRole);
    }
}
