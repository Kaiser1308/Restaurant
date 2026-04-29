namespace Restaurant.Api.DTOs.Orders;

public sealed record OrderItemResponse(
    Guid Id,
    Guid MenuItemId,
    string ItemNameSnapshot,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal,
    string Status,
    string? CancelReason);
