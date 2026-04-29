using Restaurant.Api.DTOs.Tables;

namespace Restaurant.Api.Services;

public interface ITableService
{
    Task<IReadOnlyList<TableResponse>> GetAsync(CancellationToken cancellationToken = default);
    Task<TableResponse> CreateAsync(CreateTableRequest request, CancellationToken cancellationToken = default);
    Task<TableResponse> UpdateAsync(Guid id, UpdateTableRequest request, CancellationToken cancellationToken = default);
}
