namespace Restaurant.Api.DTOs.MenuItems;

public sealed record CreateMenuItemRequest(
    Guid CategoryId,
    string Name,
    decimal Price,
    string? Description,
    bool IsAvailable);
