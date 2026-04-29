using Restaurant.Api.Domain.Entities;

namespace Restaurant.Api.Repositories;

public interface IMenuItemRepository
{
    Task<List<MenuItem>> QueryAsync(Guid? categoryId, string? search, CancellationToken cancellationToken = default);
    Task<MenuItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(MenuItem menuItem, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
