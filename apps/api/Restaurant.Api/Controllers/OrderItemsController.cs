using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Restaurant.Api.DTOs.Orders;
using Restaurant.Api.Services;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class OrderItemsController(
    IOrderService orderService,
    IValidator<UpdateOrderItemRequest> updateValidator,
    IValidator<CancelOrderItemRequest> cancelValidator) : ControllerBase
{
    [HttpPatch("{itemId:guid}")]
    [Authorize(Policy = "WaiterOrAbove")]
    public async Task<ActionResult<OrderDetailResponse>> Update(Guid itemId, UpdateOrderItemRequest request, CancellationToken cancellationToken)
    {
        await updateValidator.ValidateAndThrowAsync(request, cancellationToken);
        var result = await orderService.UpdateItemAsync(itemId, request, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{itemId:guid}/cancel")]
    [Authorize(Policy = "WaiterOrAbove")]
    public async Task<ActionResult<OrderDetailResponse>> Cancel(Guid itemId, CancelOrderItemRequest request, CancellationToken cancellationToken)
    {
        await cancelValidator.ValidateAndThrowAsync(request, cancellationToken);
        var result = await orderService.CancelItemAsync(itemId, request, cancellationToken);
        return Ok(result);
    }
}
