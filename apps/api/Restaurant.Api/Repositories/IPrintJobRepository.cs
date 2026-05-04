using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Repositories;

public interface IPrintJobRepository
{
    Task<IReadOnlyList<PrintJob>> GetPendingAsync(PrinterType? printerType, int limit, CancellationToken cancellationToken = default);
    Task<PrintJob?> GetLatestByEntityAsync(Guid tenantId, string entityType, Guid entityId, PrinterType? printerType, CancellationToken cancellationToken = default);
    Task<PrintJob?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
