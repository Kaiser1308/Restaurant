using Restaurant.Api.DTOs.Orders;

namespace Restaurant.Api.Services;

public interface IOrderService
{
    Task<CreateOrderResponse> CreateAsync(CreateOrderRequest request, CancellationToken cancellationToken = default);
    Task<OrderDetailResponse> GetDetailAsync(Guid orderId, CancellationToken cancellationToken = default);
    Task<OrderDetailResponse?> GetActiveByTableAsync(Guid tableId, CancellationToken cancellationToken = default);
    Task<OrderDetailResponse> AddItemAsync(Guid orderId, AddOrderItemRequest request, CancellationToken cancellationToken = default);
    Task<OrderDetailResponse> UpdateItemAsync(Guid itemId, UpdateOrderItemRequest request, CancellationToken cancellationToken = default);
    Task<OrderDetailResponse> CancelItemAsync(Guid itemId, CancelOrderItemRequest request, CancellationToken cancellationToken = default);
    Task<SendToKitchenResponse> SendToKitchenAsync(Guid orderId, CancellationToken cancellationToken = default);
}
