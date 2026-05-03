namespace Restaurant.Api.DTOs.Bills;

public sealed record BillSummaryResponse(
    Guid Id,
    string BillNumber,
    Guid OrderId,
    string TableName,
    string Status,
    string PaymentType,
    decimal TotalAmount,
    DateTimeOffset PaidAt);
