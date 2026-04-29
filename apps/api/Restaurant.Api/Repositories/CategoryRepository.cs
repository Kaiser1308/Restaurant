using Microsoft.EntityFrameworkCore;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Infrastructure.Persistence;

namespace Restaurant.Api.Repositories;

public sealed class CategoryRepository(RestaurantDbContext dbContext) : ICategoryRepository
{
    public Task<List<Category>> GetActiveAsync(CancellationToken cancellationToken = default)
        => dbContext.Categories.Where(x => x.IsActive).OrderBy(x => x.SortOrder).ToListAsync(cancellationToken);

    public Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => dbContext.Categories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<Category?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
        => dbContext.Categories.FirstOrDefaultAsync(x => x.Name == name, cancellationToken);

    public Task AddAsync(Category category, CancellationToken cancellationToken = default)
        => dbContext.Categories.AddAsync(category, cancellationToken).AsTask();

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => dbContext.SaveChangesAsync(cancellationToken);
}
