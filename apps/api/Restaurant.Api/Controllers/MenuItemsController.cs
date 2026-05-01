using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Restaurant.Api.DTOs.MenuItems;
using Restaurant.Api.Services;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/menu-items")]
[Authorize]
public sealed class MenuItemsController(
    IMenuItemService menuItemService,
    IValidator<CreateMenuItemRequest> createValidator,
    IValidator<UpdateMenuItemRequest> updateValidator) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "WaiterOrAbove")]
    public Task<IReadOnlyList<MenuItemResponse>> Get([FromQuery] Guid? categoryId, [FromQuery] string? search, CancellationToken cancellationToken)
        => menuItemService.QueryAsync(categoryId, search, cancellationToken);

    [HttpPost]
    [Authorize(Policy = "OwnerOrManager")]
    public async Task<ActionResult<MenuItemResponse>> Create(CreateMenuItemRequest request, CancellationToken cancellationToken)
    {
        await createValidator.ValidateAndThrowAsync(request, cancellationToken);
        var result = await menuItemService.CreateAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpPatch("{id:guid}")]
    [Authorize(Policy = "OwnerOrManager")]
    public async Task<ActionResult<MenuItemResponse>> Update(Guid id, UpdateMenuItemRequest request, CancellationToken cancellationToken)
    {
        await updateValidator.ValidateAndThrowAsync(request, cancellationToken);
        var result = await menuItemService.UpdateAsync(id, request, cancellationToken);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/availability")]
    [Authorize(Policy = "OwnerOrManager")]
    public async Task<ActionResult<MenuItemResponse>> UpdateAvailability(Guid id, UpdateMenuItemAvailabilityRequest request, CancellationToken cancellationToken)
    {
        var result = await menuItemService.UpdateAvailabilityAsync(id, request, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/image")]
    [Authorize(Policy = "OwnerOrManager")]
    [RequestSizeLimit(2 * 1024 * 1024)]
    public async Task<ActionResult<MenuItemResponse>> UploadImage(Guid id, IFormFile image, CancellationToken cancellationToken)
    {
        var result = await menuItemService.UploadImageAsync(id, image, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}/image")]
    [Authorize(Policy = "OwnerOrManager")]
    public async Task<ActionResult<MenuItemResponse>> DeleteImage(Guid id, CancellationToken cancellationToken)
    {
        var result = await menuItemService.DeleteImageAsync(id, cancellationToken);
        return Ok(result);
    }
}
