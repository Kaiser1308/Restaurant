using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Restaurant.Api.DTOs.Orders;
using Restaurant.Api.DTOs.Tables;
using Restaurant.Api.Services;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class TablesController(
    ITableService tableService,
    IOrderService orderService,
    IValidator<CreateTableRequest> createValidator,
    IValidator<UpdateTableRequest> updateValidator) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "WaiterOrAbove")]
    public Task<IReadOnlyList<TableResponse>> Get(CancellationToken cancellationToken)
        => tableService.GetAsync(cancellationToken);

    [HttpPost]
    [Authorize(Policy = "OwnerOrManager")]
    public async Task<ActionResult<TableResponse>> Create(CreateTableRequest request, CancellationToken cancellationToken)
    {
        await createValidator.ValidateAndThrowAsync(request, cancellationToken);
        var result = await tableService.CreateAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpPatch("{id:guid}")]
    [Authorize(Policy = "OwnerOrManager")]
    public async Task<ActionResult<TableResponse>> Update(Guid id, UpdateTableRequest request, CancellationToken cancellationToken)
    {
        await updateValidator.ValidateAndThrowAsync(request, cancellationToken);
        var result = await tableService.UpdateAsync(id, request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{tableId:guid}/active-order")]
    [Authorize(Policy = "WaiterOrAbove")]
    public async Task<ActionResult<OrderDetailResponse>> GetActiveOrder(Guid tableId, CancellationToken cancellationToken)
    {
        var result = await orderService.GetActiveByTableAsync(tableId, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
