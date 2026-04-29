namespace Restaurant.Api.DTOs.Orders;

public sealed record CreateOrderResponse(
    Guid Id,
    Guid TableId,
    string Status,
    DateTimeOffset CreatedAt);
