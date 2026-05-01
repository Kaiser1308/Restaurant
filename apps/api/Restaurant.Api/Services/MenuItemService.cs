using FluentValidation;
using Microsoft.Extensions.Options;
using Restaurant.Api.Common.Exceptions;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.DTOs.MenuItems;
using Restaurant.Api.Infrastructure.Auth;
using Restaurant.Api.Infrastructure.Storage;
using Restaurant.Api.Repositories;

namespace Restaurant.Api.Services;

public sealed class MenuItemService(
    IMenuItemRepository menuItemRepository,
    ICategoryRepository categoryRepository,
    ITenantContext tenantContext,
    IObjectStorageService objectStorageService,
    IOptions<StorageOptions> storageOptions,
    ILogger<MenuItemService> logger) : IMenuItemService
{
    public async Task<IReadOnlyList<MenuItemResponse>> QueryAsync(Guid? categoryId, string? search, CancellationToken cancellationToken = default)
    {
        var items = await menuItemRepository.QueryAsync(categoryId, search, cancellationToken);
        var responses = new List<MenuItemResponse>();
        foreach (var item in items)
        {
            responses.Add(await MapAsync(item, cancellationToken));
        }
        return responses;
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
        return await MapAsync(item, cancellationToken);
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
        return await MapAsync(item, cancellationToken);
    }

    public async Task<MenuItemResponse> UpdateAvailabilityAsync(Guid id, UpdateMenuItemAvailabilityRequest request, CancellationToken cancellationToken = default)
    {
        var item = await menuItemRepository.GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException("Menu item not found.");
        item.IsAvailable = request.IsAvailable;
        item.UpdatedAt = DateTimeOffset.UtcNow;
        await menuItemRepository.SaveChangesAsync(cancellationToken);
        return await MapAsync(item, cancellationToken);
    }

    public async Task<MenuItemResponse> UploadImageAsync(Guid id, IFormFile image, CancellationToken cancellationToken = default)
    {
        ValidateImage(image);

        var item = await menuItemRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Menu item not found.");

        var tenantId = tenantContext.TenantId ?? Guid.Empty;
        var oldObjectKey = item.ImageObjectKey;
        var extension = GetFileExtension(image.ContentType);
        var objectKey = $"tenants/{tenantId}/menu-items/{item.Id}/{Guid.NewGuid():N}{extension}";

        await using var stream = image.OpenReadStream();
        await objectStorageService.PutAsync(objectKey, stream, image.ContentType, cancellationToken);

        item.ImageObjectKey = objectKey;
        item.UpdatedAt = DateTimeOffset.UtcNow;
        await menuItemRepository.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(oldObjectKey))
        {
            try
            {
                await objectStorageService.DeleteAsync(oldObjectKey, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to delete old menu item image {ObjectKey}", oldObjectKey);
            }
        }

        return await MapAsync(item, cancellationToken);
    }

    public async Task<MenuItemResponse> DeleteImageAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var item = await menuItemRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Menu item not found.");

        var oldObjectKey = item.ImageObjectKey;
        item.ImageObjectKey = null;
        item.UpdatedAt = DateTimeOffset.UtcNow;
        await menuItemRepository.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(oldObjectKey))
        {
            await objectStorageService.DeleteAsync(oldObjectKey, cancellationToken);
        }

        return await MapAsync(item, cancellationToken);
    }

    private async Task<MenuItemResponse> MapAsync(MenuItem item, CancellationToken cancellationToken)
    {
        string? imageUrl = null;
        if (!string.IsNullOrWhiteSpace(item.ImageObjectKey))
        {
            imageUrl = await objectStorageService.GetPresignedReadUrlAsync(
                item.ImageObjectKey,
                TimeSpan.FromMinutes(storageOptions.Value.PresignedUrlTtlMinutes),
                cancellationToken);
        }

        return new MenuItemResponse(
            item.Id,
            item.CategoryId,
            item.Name,
            item.Price,
            item.Description,
            item.IsAvailable,
            item.IsActive,
            imageUrl);
    }

    private const long MaxImageBytes = 2 * 1024 * 1024;
    private static readonly HashSet<string> AllowedImageContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };

    private static string GetFileExtension(string contentType)
        => contentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => throw new ValidationException("Unsupported image type.")
        };

    private static void ValidateImage(IFormFile image)
    {
        if (image.Length == 0)
        {
            throw new ValidationException("Image file is required.");
        }

        if (image.Length > MaxImageBytes)
        {
            throw new ValidationException("Image file must be 2 MB or smaller.");
        }

        if (!AllowedImageContentTypes.Contains(image.ContentType))
        {
            throw new ValidationException("Image must be JPG, PNG, or WebP.");
        }
    }
}
