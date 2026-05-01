using Restaurant.Api.DTOs.Reports;

namespace Restaurant.Api.Services;

public interface IReportService
{
    Task<DailyRevenueResponse> GetDailyRevenueAsync(DateOnly date, CancellationToken cancellationToken = default);
}
