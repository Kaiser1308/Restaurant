namespace Restaurant.Api.DTOs.MenuItems;

public sealed record MenuItemResponse(
    Guid Id,
    Guid CategoryId,
    string Name,
    decimal Price,
    string? Description,
    bool IsAvailable,
    bool IsActive,
    string? ImageUrl);
