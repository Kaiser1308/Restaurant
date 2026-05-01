namespace Restaurant.Api.DTOs.Reports;

public sealed record DailyRevenueResponse(
    DateOnly Date,
    decimal TotalRevenue,
    int PaidBillCount,
    int VoidedBillCount,
    decimal VoidedAmount);
