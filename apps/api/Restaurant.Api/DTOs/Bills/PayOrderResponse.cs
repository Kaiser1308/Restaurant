namespace Restaurant.Api.DTOs.Bills;

public sealed record PayOrderResponse(
    Guid BillId,
    string BillNumber,
    Guid OrderId,
    string Status,
    string PaymentType,
    decimal TotalAmount,
    DateTimeOffset PaidAt,
    Guid PrintJobId);
