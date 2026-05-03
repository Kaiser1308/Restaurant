namespace Restaurant.Api.DTOs.Bills;

public sealed record BillResponse(
    Guid Id,
    string BillNumber,
    Guid OrderId,
    Guid TableId,
    string TableName,
    string Status,
    string PaymentType,
    decimal TotalAmount,
    IReadOnlyList<BillItemResponse> Items,
    DateTimeOffset PaidAt,
    DateTimeOffset? VoidedAt,
    string? VoidReason);
