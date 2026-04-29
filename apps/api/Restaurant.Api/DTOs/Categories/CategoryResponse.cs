namespace Restaurant.Api.DTOs.Categories;

public sealed record CategoryResponse(
    Guid Id,
    string Name,
    int SortOrder,
    bool IsActive);
