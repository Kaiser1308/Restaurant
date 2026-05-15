namespace Restaurant.Api.DTOs.Orders;

public sealed record SendToKitchenResponse(
    Guid Id,
    string Status,
    Guid PrintJobId);
