using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Restaurant.Api.DTOs.Reports;
using Restaurant.Api.Services;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public sealed class ReportsController(IReportService reportService) : ControllerBase
{
    [HttpGet("daily-revenue")]
    [Authorize(Policy = "CashierOrAbove")]
    public Task<DailyRevenueResponse> DailyRevenue([FromQuery] DateOnly date, CancellationToken cancellationToken)
        => reportService.GetDailyRevenueAsync(date, cancellationToken);
}
