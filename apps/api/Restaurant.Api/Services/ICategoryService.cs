using Restaurant.Api.DTOs.Categories;

namespace Restaurant.Api.Services;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryResponse>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<CategoryResponse> CreateAsync(CreateCategoryRequest request, CancellationToken cancellationToken = default);
    Task<CategoryResponse> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken cancellationToken = default);
}
