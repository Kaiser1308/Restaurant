namespace Restaurant.Api.DTOs.Categories;

public sealed record UpdateCategoryRequest(
    string Name,
    int SortOrder,
    bool IsActive);
