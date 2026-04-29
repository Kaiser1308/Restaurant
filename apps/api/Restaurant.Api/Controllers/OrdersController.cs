using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Restaurant.Api.DTOs.Orders;
using Restaurant.Api.Services;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class OrdersController(
    IOrderService orderService,
    IValidator<AddOrderItemRequest> addItemValidator) : ControllerBase
{
    [HttpPost]
    [Authorize(Policy = "WaiterOrAbove")]
    public async Task<ActionResult<CreateOrderResponse>> Create(CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var result = await orderService.CreateAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "WaiterOrAbove")]
    public Task<OrderDetailResponse> Get(Guid id, CancellationToken cancellationToken)
        => orderService.GetDetailAsync(id, cancellationToken);

    [HttpPost("{id:guid}/items")]
    [Authorize(Policy = "WaiterOrAbove")]
    public async Task<ActionResult<OrderDetailResponse>> AddItem(Guid id, AddOrderItemRequest request, CancellationToken cancellationToken)
    {
        await addItemValidator.ValidateAndThrowAsync(request, cancellationToken);
        var result = await orderService.AddItemAsync(id, request, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/send-to-kitchen")]
    [Authorize(Policy = "WaiterOrAbove")]
    public Task<SendToKitchenResponse> SendToKitchen(Guid id, CancellationToken cancellationToken)
        => orderService.SendToKitchenAsync(id, cancellationToken);
}
