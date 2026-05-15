using System.Security.Cryptography;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Restaurant.Api.Common.Exceptions;
using Restaurant.Api.DTOs.PrintJobs;
using Restaurant.Api.Services;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/print-jobs")]
public sealed class PrintJobsController(
    IPrintJobService printJobService,
    IValidator<MarkPrintJobFailedRequest> failedRequestValidator,
    IOptions<PrintAgentOptions> printAgentOptions) : ControllerBase
{
    private const string AgentKeyHeader = "X-Print-Agent-Key";

    [HttpGet("pending")]
    public async Task<ActionResult<IReadOnlyList<PrintJobResponse>>> GetPending(
        [FromQuery] string? printerType,
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        GuardAgentKey();
        var result = await printJobService.GetPendingAsync(printerType, limit, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/mark-printing")]
    public async Task<ActionResult<PrintJobResponse>> MarkPrinting(Guid id, CancellationToken cancellationToken)
    {
        GuardAgentKey();
        var result = await printJobService.MarkPrintingAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/mark-printed")]
    public async Task<ActionResult<PrintJobResponse>> MarkPrinted(Guid id, CancellationToken cancellationToken)
    {
        GuardAgentKey();
        var result = await printJobService.MarkPrintedAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/mark-failed")]
    public async Task<ActionResult<PrintJobResponse>> MarkFailed(Guid id, MarkPrintJobFailedRequest request, CancellationToken cancellationToken)
    {
        GuardAgentKey();
        await failedRequestValidator.ValidateAndThrowAsync(request, cancellationToken);
        var result = await printJobService.MarkFailedAsync(id, request, cancellationToken);
        return Ok(result);
    }

    private void GuardAgentKey()
    {
        var headerValue = Request.Headers[AgentKeyHeader].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(headerValue))
        {
            throw new UnauthorizedException("Invalid or missing print agent key.");
        }

        var expectedBytes = System.Text.Encoding.UTF8.GetBytes(printAgentOptions.Value.AgentKey ?? string.Empty);
        var actualBytes = System.Text.Encoding.UTF8.GetBytes(headerValue);

        if (expectedBytes.Length != actualBytes.Length || !CryptographicOperations.FixedTimeEquals(expectedBytes, actualBytes))
        {
            throw new UnauthorizedException("Invalid or missing print agent key.");
        }
    }
}
