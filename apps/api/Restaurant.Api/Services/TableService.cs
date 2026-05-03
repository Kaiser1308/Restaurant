using Restaurant.Api.Common.Exceptions;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.DTOs.Tables;
using Restaurant.Api.Infrastructure.Auth;
using Restaurant.Api.Repositories;

namespace Restaurant.Api.Services;

public sealed class TableService(
    ITableRepository tableRepository,
    ITenantContext tenantContext) : ITableService
{
    public async Task<IReadOnlyList<TableResponse>> GetAsync(CancellationToken cancellationToken = default)
    {
        var tables = await tableRepository.GetTablesAsync(cancellationToken);
        return tables.Select(Map).ToList();
    }

    public async Task<TableResponse> CreateAsync(CreateTableRequest request, CancellationToken cancellationToken = default)
    {
        var existed = await tableRepository.GetByNameAsync(request.Name.Trim(), cancellationToken);
        if (existed is not null)
        {
            throw new ConflictException("Table name already exists.");
        }

        var table = new RestaurantTable
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.RequireTenantId(),
            Name = request.Name.Trim(),
            Status = TableStatus.Available,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        await tableRepository.AddAsync(table, cancellationToken);
        await tableRepository.SaveChangesAsync(cancellationToken);
        return Map(table);
    }

    public async Task<TableResponse> UpdateAsync(Guid id, UpdateTableRequest request, CancellationToken cancellationToken = default)
    {
        var table = await tableRepository.GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException("Table not found.");
        table.Name = request.Name.Trim();
        if (!Enum.TryParse<TableStatus>(request.Status, true, out var status))
        {
            throw new BusinessException("Invalid table status.");
        }

        table.Status = status;
        table.UpdatedAt = DateTimeOffset.UtcNow;
        await tableRepository.SaveChangesAsync(cancellationToken);
        return Map(table);
    }

    private static TableResponse Map(RestaurantTable table) => new(table.Id, table.Name, table.Status.ToString());
}
