using Restaurant.Api.Domain.Enums;
using Restaurant.Api.DTOs.Reports;
using Restaurant.Api.Repositories;

namespace Restaurant.Api.Services;

public sealed class ReportService(IBillRepository billRepository) : IReportService
{
    public async Task<DailyRevenueResponse> GetDailyRevenueAsync(DateOnly date, CancellationToken cancellationToken = default)
    {
        var bills = await billRepository.ListAsync(date, null, cancellationToken);
        var paidBills = bills.Where(x => x.Status == BillStatus.Paid).ToList();
        var voidedBills = bills.Where(x => x.Status == BillStatus.Voided).ToList();

        return new DailyRevenueResponse(
            date,
            paidBills.Sum(x => x.TotalAmount),
            paidBills.Count,
            voidedBills.Count,
            voidedBills.Sum(x => x.TotalAmount));
    }
}
