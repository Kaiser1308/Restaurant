namespace Restaurant.Api.DTOs.Bills;

public sealed record BillItemResponse(
    Guid Id,
    Guid? OrderItemId,
    string ItemNameSnapshot,
    decimal UnitPriceSnapshot,
    int Quantity,
    decimal LineTotal);
