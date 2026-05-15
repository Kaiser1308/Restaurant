using Restaurant.Api.DTOs.Bills;

namespace Restaurant.Api.Services;

public interface IBillService
{
    Task<BillPreviewResponse> PreviewOrderAsync(Guid orderId, CancellationToken cancellationToken = default);
    Task<PayOrderResponse> PayOrderAsync(Guid orderId, PayOrderRequest request, CancellationToken cancellationToken = default);
    Task<BillResponse> GetAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BillSummaryResponse>> ListAsync(DateOnly? date, string? status, CancellationToken cancellationToken = default);
    Task<BillResponse> VoidAsync(Guid id, VoidBillRequest request, CancellationToken cancellationToken = default);
}
