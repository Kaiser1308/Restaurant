using Restaurant.Api.Common.Exceptions;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.DTOs.MenuItems;
using Restaurant.Api.Infrastructure.Auth;
using Restaurant.Api.Repositories;

namespace Restaurant.Api.Services;

public sealed class MenuItemService(
    IMenuItemRepository menuItemRepository,
    ICategoryRepository categoryRepository,
    ITenantContext tenantContext) : IMenuItemService
{
    public async Task<IReadOnlyList<MenuItemResponse>> QueryAsync(Guid? categoryId, string? search, CancellationToken cancellationToken = default)
    {
        var items = await menuItemRepository.QueryAsync(categoryId, search, cancellationToken);
        return items.Select(Map).ToList();
    }

    public async Task<MenuItemResponse> CreateAsync(CreateMenuItemRequest request, CancellationToken cancellationToken = default)
    {
        _ = await categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken) ?? throw new NotFoundException("Category not found.");
        var item = new MenuItem
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.TenantId ?? Guid.Empty,
            CategoryId = request.CategoryId,
            Name = request.Name.Trim(),
            Price = request.Price,
            Description = request.Description?.Trim(),
            IsAvailable = request.IsAvailable,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        await menuItemRepository.AddAsync(item, cancellationToken);
        await menuItemRepository.SaveChangesAsync(cancellationToken);
        return Map(item);
    }

    public async Task<MenuItemResponse> UpdateAsync(Guid id, UpdateMenuItemRequest request, CancellationToken cancellationToken = default)
    {
        var item = await menuItemRepository.GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException("Menu item not found.");
        _ = await categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken) ?? throw new NotFoundException("Category not found.");
        item.CategoryId = request.CategoryId;
        item.Name = request.Name.Trim();
        item.Price = request.Price;
        item.Description = request.Description?.Trim();
        item.IsActive = request.IsActive;
        item.UpdatedAt = DateTimeOffset.UtcNow;
        await menuItemRepository.SaveChangesAsync(cancellationToken);
        return Map(item);
    }

    public async Task<MenuItemResponse> UpdateAvailabilityAsync(Guid id, UpdateMenuItemAvailabilityRequest request, CancellationToken cancellationToken = default)
    {
        var item = await menuItemRepository.GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException("Menu item not found.");
        item.IsAvailable = request.IsAvailable;
        item.UpdatedAt = DateTimeOffset.UtcNow;
        await menuItemRepository.SaveChangesAsync(cancellationToken);
        return Map(item);
    }

    private static MenuItemResponse Map(MenuItem item)
        => new(item.Id, item.CategoryId, item.Name, item.Price, item.Description, item.IsAvailable, item.IsActive);
}
