namespace Restaurant.Api.DTOs.Orders;

public sealed record OrderDetailResponse(
    Guid Id,
    Guid TableId,
    string TableName,
    string Status,
    IReadOnlyList<OrderItemResponse> Items,
    decimal TotalAmount,
    DateTimeOffset CreatedAt);
