using Restaurant.Api.Common.Exceptions;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.DTOs.PrintJobs;
using Restaurant.Api.Repositories;

namespace Restaurant.Api.Services;

public sealed class PrintJobService(IPrintJobRepository printJobRepository) : IPrintJobService
{
    public async Task<IReadOnlyList<PrintJobResponse>> GetPendingAsync(string? printerType, int limit, CancellationToken cancellationToken = default)
    {
        PrinterType? parsedPrinterType = null;
        if (!string.IsNullOrWhiteSpace(printerType))
        {
            if (!Enum.TryParse<PrinterType>(printerType, true, out var value))
            {
                throw new BusinessException("Invalid printer type.");
            }

            parsedPrinterType = value;
        }

        var jobs = await printJobRepository.GetPendingAsync(parsedPrinterType, limit, cancellationToken);
        return jobs.Select(Map).ToList();
    }

    public async Task<PrintJobResponse> MarkPrintingAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var job = await printJobRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Print job not found.");

        if (job.Status != PrintJobStatus.Pending && job.Status != PrintJobStatus.Failed)
        {
            throw new BusinessException("Only pending or failed print jobs can be marked as printing.");
        }

        var now = DateTimeOffset.UtcNow;
        job.Status = PrintJobStatus.Printing;
        job.ErrorMessage = null;
        job.UpdatedAt = now;

        await printJobRepository.SaveChangesAsync(cancellationToken);
        return Map(job);
    }

    public async Task<PrintJobResponse> MarkPrintedAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var job = await printJobRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Print job not found.");

        if (job.Status != PrintJobStatus.Printing)
        {
            throw new BusinessException("Print job must be in Printing status to mark as printed.");
        }

        var now = DateTimeOffset.UtcNow;
        job.Status = PrintJobStatus.Printed;
        job.ErrorMessage = null;
        job.PrintedAt = now;
        job.UpdatedAt = now;

        await printJobRepository.SaveChangesAsync(cancellationToken);
        return Map(job);
    }

    public async Task<PrintJobResponse> MarkFailedAsync(Guid id, MarkPrintJobFailedRequest request, CancellationToken cancellationToken = default)
    {
        var job = await printJobRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Print job not found.");

        if (job.Status != PrintJobStatus.Printing)
        {
            throw new BusinessException("Print job must be in Printing status to mark as failed.");
        }

        var now = DateTimeOffset.UtcNow;
        job.Status = PrintJobStatus.Failed;
        job.ErrorMessage = request.ErrorMessage.Trim();
        job.RetryCount += 1;
        job.UpdatedAt = now;

        await printJobRepository.SaveChangesAsync(cancellationToken);
        return Map(job);
    }

    private static PrintJobResponse Map(Domain.Entities.PrintJob job)
        => new(
            job.Id,
            job.TenantId,
            job.EntityType,
            job.EntityId,
            job.PrinterType.ToString(),
            job.PrintKey,
            job.Status.ToString(),
            job.ContentJson,
            job.ErrorMessage,
            job.RetryCount,
            job.PrintedAt,
            job.CreatedAt,
            job.UpdatedAt);
}
