namespace Restaurant.Api.DTOs.Orders;

public sealed record AddOrderItemRequest(
    Guid MenuItemId,
    int Quantity);
