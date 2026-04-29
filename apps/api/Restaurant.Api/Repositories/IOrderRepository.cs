using Restaurant.Api.Domain.Entities;

namespace Restaurant.Api.Repositories;

public interface IOrderRepository
{
    Task<Order?> GetOrderDetailAsync(Guid orderId, CancellationToken cancellationToken = default);
    Task<Order?> GetActiveOrderByTableAsync(Guid tableId, CancellationToken cancellationToken = default);
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OrderItem?> GetItemByIdAsync(Guid itemId, CancellationToken cancellationToken = default);
    Task AddOrderAsync(Order order, CancellationToken cancellationToken = default);
    Task AddOrderItemAsync(OrderItem item, CancellationToken cancellationToken = default);
    Task AddAuditLogAsync(AuditLog log, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
