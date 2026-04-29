using Restaurant.Api.Domain.Entities;

namespace Restaurant.Api.Repositories;

public interface ITableRepository
{
    Task<List<RestaurantTable>> GetTablesAsync(CancellationToken cancellationToken = default);
    Task<RestaurantTable?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<RestaurantTable?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task AddAsync(RestaurantTable table, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
