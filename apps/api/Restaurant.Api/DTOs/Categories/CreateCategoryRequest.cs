namespace Restaurant.Api.DTOs.Categories;

public sealed record CreateCategoryRequest(
    string Name,
    int SortOrder);
