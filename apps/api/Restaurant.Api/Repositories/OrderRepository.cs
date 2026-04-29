using Microsoft.EntityFrameworkCore;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.Infrastructure.Persistence;

namespace Restaurant.Api.Repositories;

public sealed class OrderRepository(RestaurantDbContext dbContext) : IOrderRepository
{
    public Task<Order?> GetOrderDetailAsync(Guid orderId, CancellationToken cancellationToken = default)
        => dbContext.Orders
            .Include(x => x.Table)
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == orderId, cancellationToken);

    public Task<Order?> GetActiveOrderByTableAsync(Guid tableId, CancellationToken cancellationToken = default)
        => dbContext.Orders
            .Include(x => x.Table)
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.TableId == tableId && (x.Status == OrderStatus.Pending || x.Status == OrderStatus.SentToKitchen), cancellationToken);

    public Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => dbContext.Orders.Include(x => x.Items).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<OrderItem?> GetItemByIdAsync(Guid itemId, CancellationToken cancellationToken = default)
        => dbContext.OrderItems
            .Include(x => x.Order)
            .FirstOrDefaultAsync(x => x.Id == itemId, cancellationToken);

    public Task AddOrderAsync(Order order, CancellationToken cancellationToken = default)
        => dbContext.Orders.AddAsync(order, cancellationToken).AsTask();

    public Task AddOrderItemAsync(OrderItem item, CancellationToken cancellationToken = default)
        => dbContext.OrderItems.AddAsync(item, cancellationToken).AsTask();

    public Task AddAuditLogAsync(AuditLog log, CancellationToken cancellationToken = default)
        => dbContext.AuditLogs.AddAsync(log, cancellationToken).AsTask();

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => dbContext.SaveChangesAsync(cancellationToken);
}
