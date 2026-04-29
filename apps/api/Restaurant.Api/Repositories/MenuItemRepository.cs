using Microsoft.EntityFrameworkCore;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Infrastructure.Persistence;

namespace Restaurant.Api.Repositories;

public sealed class MenuItemRepository(RestaurantDbContext dbContext) : IMenuItemRepository
{
    public async Task<List<MenuItem>> QueryAsync(Guid? categoryId, string? search, CancellationToken cancellationToken = default)
    {
        var query = dbContext.MenuItems.Include(x => x.Category).Where(x => x.IsActive).AsQueryable();
        if (categoryId.HasValue)
        {
            query = query.Where(x => x.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLowerInvariant();
            query = query.Where(x => x.Name.ToLower().Contains(normalizedSearch));
        }

        return await query.OrderBy(x => x.Name).ToListAsync(cancellationToken);
    }

    public Task<MenuItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => dbContext.MenuItems.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task AddAsync(MenuItem menuItem, CancellationToken cancellationToken = default)
        => dbContext.MenuItems.AddAsync(menuItem, cancellationToken).AsTask();

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => dbContext.SaveChangesAsync(cancellationToken);
}
