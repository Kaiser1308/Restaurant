namespace Restaurant.Api.DTOs.MenuItems;

public sealed record UpdateMenuItemRequest(
    Guid CategoryId,
    string Name,
    decimal Price,
    string? Description,
    bool IsActive);
