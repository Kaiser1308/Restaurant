using Microsoft.EntityFrameworkCore;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.Infrastructure.Persistence;

namespace Restaurant.Api.Repositories;

public sealed class PrintJobRepository(RestaurantDbContext dbContext) : IPrintJobRepository
{
    public async Task<IReadOnlyList<PrintJob>> GetPendingAsync(PrinterType? printerType, int limit, CancellationToken cancellationToken = default)
    {
        var cappedLimit = Math.Clamp(limit, 1, 50);
        var query = dbContext.PrintJobs
            .Where(x => x.Status == PrintJobStatus.Pending);

        if (printerType is not null)
        {
            query = query.Where(x => x.PrinterType == printerType);
        }

        return await query
            .OrderBy(x => x.CreatedAt)
            .Take(cappedLimit)
            .ToListAsync(cancellationToken);
    }

    public Task<PrintJob?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => dbContext.PrintJobs.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => dbContext.SaveChangesAsync(cancellationToken);
}
