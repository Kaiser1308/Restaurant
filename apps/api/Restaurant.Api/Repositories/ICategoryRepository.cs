using Restaurant.Api.Domain.Entities;

namespace Restaurant.Api.Repositories;

public interface ICategoryRepository
{
    Task<List<Category>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Category?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task AddAsync(Category category, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
