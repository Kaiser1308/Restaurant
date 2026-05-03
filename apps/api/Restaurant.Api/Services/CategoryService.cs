using Restaurant.Api.Common.Exceptions;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.DTOs.Categories;
using Restaurant.Api.Infrastructure.Auth;
using Restaurant.Api.Repositories;

namespace Restaurant.Api.Services;

public sealed class CategoryService(
    ICategoryRepository categoryRepository,
    ITenantContext tenantContext) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryResponse>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var categories = await categoryRepository.GetActiveAsync(cancellationToken);
        return categories.Select(Map).ToList();
    }

    public async Task<CategoryResponse> CreateAsync(CreateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var existed = await categoryRepository.GetByNameAsync(request.Name.Trim(), cancellationToken);
        if (existed is not null)
        {
            throw new ConflictException("Category name already exists.");
        }

        var category = new Category
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.RequireTenantId(),
            Name = request.Name.Trim(),
            SortOrder = request.SortOrder,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        await categoryRepository.AddAsync(category, cancellationToken);
        await categoryRepository.SaveChangesAsync(cancellationToken);
        return Map(category);
    }

    public async Task<CategoryResponse> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var category = await categoryRepository.GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException("Category not found.");
        category.Name = request.Name.Trim();
        category.SortOrder = request.SortOrder;
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTimeOffset.UtcNow;
        await categoryRepository.SaveChangesAsync(cancellationToken);
        return Map(category);
    }

    private static CategoryResponse Map(Category category) => new(category.Id, category.Name, category.SortOrder, category.IsActive);
}
