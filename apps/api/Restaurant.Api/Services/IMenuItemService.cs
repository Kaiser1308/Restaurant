using Restaurant.Api.DTOs.MenuItems;

namespace Restaurant.Api.Services;

public interface IMenuItemService
{
    Task<IReadOnlyList<MenuItemResponse>> QueryAsync(Guid? categoryId, string? search, CancellationToken cancellationToken = default);
    Task<MenuItemResponse> CreateAsync(CreateMenuItemRequest request, CancellationToken cancellationToken = default);
    Task<MenuItemResponse> UpdateAsync(Guid id, UpdateMenuItemRequest request, CancellationToken cancellationToken = default);
    Task<MenuItemResponse> UpdateAvailabilityAsync(Guid id, UpdateMenuItemAvailabilityRequest request, CancellationToken cancellationToken = default);
    Task<MenuItemResponse> UploadImageAsync(Guid id, IFormFile image, CancellationToken cancellationToken = default);
    Task<MenuItemResponse> DeleteImageAsync(Guid id, CancellationToken cancellationToken = default);
}
