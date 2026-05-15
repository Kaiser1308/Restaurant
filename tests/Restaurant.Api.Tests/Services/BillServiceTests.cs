using Microsoft.EntityFrameworkCore.Storage;
using Restaurant.Api.Common.Exceptions;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.DTOs.Bills;
using Restaurant.Api.Infrastructure.Auth;
using Restaurant.Api.Repositories;
using Restaurant.Api.Services;

namespace Restaurant.Api.Tests.Services;

public class BillServiceTests
{
    private readonly Mock<IBillRepository> _billRepo = new();
    private readonly Mock<IAuditLogRepository> _auditRepo = new();
    private readonly Mock<IPermissionService> _permissionService = new();
    private readonly Mock<ITenantContext> _tenantContext = new();

    private BillService CreateService() => new(
        _billRepo.Object,
        _auditRepo.Object,
        _permissionService.Object,
        _tenantContext.Object);

    private void SetupTenantContext()
    {
        _tenantContext.Setup(x => x.RequireTenantId()).Returns(Guid.NewGuid());
        _tenantContext.Setup(x => x.RequireUserId()).Returns(Guid.NewGuid());
        _tenantContext.Setup(x => x.RequireRole()).Returns(UserRole.Owner);
    }

    private void SetupAuditRepo()
    {
        _auditRepo.Setup(x => x.AddAsync(It.IsAny<AuditLog>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
    }

    private void SetupBillRepoWriteMethods()
    {
        _billRepo.Setup(x => x.AddBillAsync(It.IsAny<Bill>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _billRepo.Setup(x => x.AddPrintJobAsync(It.IsAny<PrintJob>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _billRepo.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
    }

    private Order CreateOrderWithItems()
    {
        var orderId = Guid.NewGuid();
        var tableId = Guid.NewGuid();
        return new Order
        {
            Id = orderId,
            TableId = tableId,
            Status = OrderStatus.SentToKitchen,
            Table = new RestaurantTable { Id = tableId, Name = "Bàn 1", Status = TableStatus.Occupied },
            Items = new List<OrderItem>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    OrderId = orderId,
                    MenuItemId = Guid.NewGuid(),
                    ItemNameSnapshot = "Phở Bò",
                    Quantity = 2,
                    UnitPrice = 50000m,
                    Status = OrderItemStatus.SentToKitchen,
                    CreatedAt = DateTimeOffset.UtcNow
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    OrderId = orderId,
                    MenuItemId = Guid.NewGuid(),
                    ItemNameSnapshot = "Trà Đá",
                    Quantity = 1,
                    UnitPrice = 10000m,
                    Status = OrderItemStatus.SentToKitchen,
                    CreatedAt = DateTimeOffset.UtcNow
                }
            }
        };
    }

    [Fact]
    public async Task PayOrderAsync_CreatesBillItemSnapshots()
    {
        SetupTenantContext();
        SetupAuditRepo();
        SetupBillRepoWriteMethods();

        var order = CreateOrderWithItems();

        var transaction = new Mock<IDbContextTransaction>();
        transaction.Setup(x => x.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _billRepo.Setup(x => x.BeginTransactionAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(transaction.Object);
        _billRepo.Setup(x => x.GetOrderForPaymentAsync(order.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);
        _billRepo.Setup(x => x.NextBillNumberAsync(It.IsAny<Guid>(), It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("20260512-0001");

        var service = CreateService();
        var request = new PayOrderRequest("Cash");

        var result = await service.PayOrderAsync(order.Id, request);

        result.TotalAmount.Should().Be(110000m);

        _billRepo.Verify(x => x.AddBillAsync(It.Is<Bill>(b =>
            b.Items.Count == 2 &&
            b.Items.Any(i => i.ItemNameSnapshot == "Phở Bò" && i.UnitPriceSnapshot == 50000m && i.Quantity == 2 && i.LineTotal == 100000m) &&
            b.Items.Any(i => i.ItemNameSnapshot == "Trà Đá" && i.UnitPriceSnapshot == 10000m && i.Quantity == 1 && i.LineTotal == 10000m) &&
            b.TotalAmount == 110000m
        ), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task VoidBillAsync_NonOwner_ThrowsForbiddenException()
    {
        SetupTenantContext();
        _tenantContext.Setup(x => x.RequireRole()).Returns(UserRole.Cashier);
        _permissionService.Setup(x => x.CanVoidBill(UserRole.Cashier)).Returns(false);

        var service = CreateService();
        var request = new VoidBillRequest("Mistake");

        var act = () => service.VoidAsync(Guid.NewGuid(), request);

        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("Only owner can void bills.");
    }

    [Fact]
    public async Task PayOrderAsync_BillNumberSequence_UsesNextBillNumber()
    {
        SetupTenantContext();
        SetupAuditRepo();
        SetupBillRepoWriteMethods();

        var order = CreateOrderWithItems();

        var transaction = new Mock<IDbContextTransaction>();
        transaction.Setup(x => x.CommitAsync(It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        _billRepo.Setup(x => x.BeginTransactionAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(transaction.Object);
        _billRepo.Setup(x => x.GetOrderForPaymentAsync(order.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);
        _billRepo.Setup(x => x.NextBillNumberAsync(It.IsAny<Guid>(), It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("20260512-0042");

        var service = CreateService();
        var request = new PayOrderRequest("Cash");

        var result = await service.PayOrderAsync(order.Id, request);

        result.BillNumber.Should().Be("20260512-0042");
    }
}
