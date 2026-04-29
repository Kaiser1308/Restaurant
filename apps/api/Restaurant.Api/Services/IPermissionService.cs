using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Services;

public interface IPermissionService
{
    bool CanVoidBill(UserRole userRole);
    bool CanManageMenu(UserRole userRole);
    bool CanManageTables(UserRole userRole);
}
