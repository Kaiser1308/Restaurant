using Microsoft.EntityFrameworkCore.Storage;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Domain.Enums;

namespace Restaurant.Api.Repositories;

public interface IBillRepository
{
    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task<Order?> GetOrderForPaymentAsync(Guid orderId, CancellationToken cancellationToken = default);
    Task<Bill?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Bill?> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Bill>> ListAsync(DateOnly? date, BillStatus? status, CancellationToken cancellationToken = default);
    Task<string> NextBillNumberAsync(Guid tenantId, DateOnly date, CancellationToken cancellationToken = default);
    Task AddBillAsync(Bill bill, CancellationToken cancellationToken = default);
    Task AddVoidLogAsync(VoidLog voidLog, CancellationToken cancellationToken = default);
    Task AddPrintJobAsync(PrintJob printJob, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
