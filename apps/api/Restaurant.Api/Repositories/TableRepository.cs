using Microsoft.EntityFrameworkCore;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Infrastructure.Persistence;

namespace Restaurant.Api.Repositories;

public sealed class TableRepository(RestaurantDbContext dbContext) : ITableRepository
{
    public Task<List<RestaurantTable>> GetTablesAsync(CancellationToken cancellationToken = default)
        => dbContext.RestaurantTables.OrderBy(x => x.Name).ToListAsync(cancellationToken);

    public Task<RestaurantTable?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => dbContext.RestaurantTables.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<RestaurantTable?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
        => dbContext.RestaurantTables.FirstOrDefaultAsync(x => x.Name == name, cancellationToken);

    public Task AddAsync(RestaurantTable table, CancellationToken cancellationToken = default)
        => dbContext.RestaurantTables.AddAsync(table, cancellationToken).AsTask();

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => dbContext.SaveChangesAsync(cancellationToken);
}
