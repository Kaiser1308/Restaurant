using Restaurant.Api.DTOs.PrintJobs;

namespace Restaurant.Api.Services;

public interface IPrintJobService
{
    Task<IReadOnlyList<PrintJobResponse>> GetPendingAsync(string? printerType, int limit, CancellationToken cancellationToken = default);
    Task<PrintJobStatusResponse> GetLatestAsync(string entityType, Guid entityId, string? printerType, CancellationToken cancellationToken = default);
    Task<PrintJobResponse> MarkPrintingAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PrintJobResponse> MarkPrintedAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PrintJobResponse> MarkFailedAsync(Guid id, MarkPrintJobFailedRequest request, CancellationToken cancellationToken = default);
}
