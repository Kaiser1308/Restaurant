using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Restaurant.Api.DTOs.Bills;
using Restaurant.Api.Services;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class BillsController(
    IBillService billService,
    IValidator<VoidBillRequest> voidBillValidator) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "CashierOrAbove")]
    public Task<IReadOnlyList<BillSummaryResponse>> List(
        [FromQuery] DateOnly? date,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
        => billService.ListAsync(date, status, cancellationToken);

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "CashierOrAbove")]
    public Task<BillResponse> Get(Guid id, CancellationToken cancellationToken)
        => billService.GetAsync(id, cancellationToken);

    [HttpPost("{id:guid}/void")]
    [Authorize(Policy = "OwnerOnly")]
    public async Task<ActionResult<BillResponse>> Void(Guid id, VoidBillRequest request, CancellationToken cancellationToken)
    {
        await voidBillValidator.ValidateAndThrowAsync(request, cancellationToken);
        var result = await billService.VoidAsync(id, request, cancellationToken);
        return Ok(result);
    }
}
