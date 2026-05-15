namespace Restaurant.Api.DTOs.Bills;

public sealed record BillPreviewResponse(
    Guid OrderId,
    Guid TableId,
    string TableName,
    string OrderStatus,
    decimal TotalAmount,
    IReadOnlyList<BillItemResponse> Items);
