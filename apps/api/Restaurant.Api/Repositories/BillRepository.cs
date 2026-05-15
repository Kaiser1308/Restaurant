using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.Infrastructure.Persistence;

namespace Restaurant.Api.Repositories;

public sealed class BillRepository(RestaurantDbContext dbContext) : IBillRepository
{
    public Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
        => dbContext.Database.BeginTransactionAsync(cancellationToken);

    public Task<Order?> GetOrderForPaymentAsync(Guid orderId, CancellationToken cancellationToken = default)
        => dbContext.Orders
            .Include(x => x.Table)
            .Include(x => x.Items)
            .Include(x => x.Bill)
            .FirstOrDefaultAsync(x => x.Id == orderId, cancellationToken);

    public Task<Bill?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => dbContext.Bills
            .Include(x => x.Order)
                .ThenInclude(x => x.Table)
            .Include(x => x.Items)
            .Include(x => x.VoidLogs)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<Bill?> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default)
        => dbContext.Bills
            .Include(x => x.Order)
                .ThenInclude(x => x.Table)
            .Include(x => x.Items)
            .Include(x => x.VoidLogs)
            .FirstOrDefaultAsync(x => x.OrderId == orderId, cancellationToken);

    public async Task<IReadOnlyList<Bill>> ListAsync(DateOnly? date, BillStatus? status, CancellationToken cancellationToken = default)
    {
        var query = dbContext.Bills
            .Include(x => x.Order)
                .ThenInclude(x => x.Table)
            .AsQueryable();

        if (date is not null)
        {
            var from = new DateTimeOffset(date.Value.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
            var to = from.AddDays(1);
            query = query.Where(x => x.PaidAt >= from && x.PaidAt < to);
        }

        if (status is not null)
        {
            query = query.Where(x => x.Status == status);
        }

        return await query
            .OrderByDescending(x => x.PaidAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> NextBillNumberAsync(Guid tenantId, DateOnly date, CancellationToken cancellationToken = default)
    {
        var sequence = await dbContext.BillNumberSequences
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Date == date, cancellationToken);

        if (sequence is null)
        {
            sequence = new BillNumberSequence
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Date = date,
                LastSequence = 1
            };
            await dbContext.BillNumberSequences.AddAsync(sequence, cancellationToken);
        }
        else
        {
            sequence.LastSequence += 1;
        }

        return $"{date:yyyyMMdd}-{sequence.LastSequence:D4}";
    }

    public Task AddBillAsync(Bill bill, CancellationToken cancellationToken = default)
        => dbContext.Bills.AddAsync(bill, cancellationToken).AsTask();

    public Task AddVoidLogAsync(VoidLog voidLog, CancellationToken cancellationToken = default)
        => dbContext.VoidLogs.AddAsync(voidLog, cancellationToken).AsTask();

    public Task AddPrintJobAsync(PrintJob printJob, CancellationToken cancellationToken = default)
        => dbContext.PrintJobs.AddAsync(printJob, cancellationToken).AsTask();

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => dbContext.SaveChangesAsync(cancellationToken);
}
