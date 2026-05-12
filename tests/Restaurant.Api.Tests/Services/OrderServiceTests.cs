using Restaurant.Api.Common.Exceptions;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.DTOs.Orders;
using Restaurant.Api.Infrastructure.Auth;
using Restaurant.Api.Repositories;
using Restaurant.Api.Services;

namespace Restaurant.Api.Tests.Services;

public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _orderRepo = new();
    private readonly Mock<ITableRepository> _tableRepo = new();
    private readonly Mock<IMenuItemRepository> _menuItemRepo = new();
    private readonly Mock<ITenantContext> _tenantContext = new();

    private OrderService CreateService() => new(
        _orderRepo.Object,
        _tableRepo.Object,
        _menuItemRepo.Object,
        _tenantContext.Object);

    private void SetupTenantContext()
    {
        _tenantContext.Setup(x => x.RequireTenantId()).Returns(Guid.NewGuid());
        _tenantContext.Setup(x => x.RequireUserId()).Returns(Guid.NewGuid());
    }

    private void SetupOrderRepoWriteMethods()
    {
        _orderRepo.Setup(x => x.AddOrderAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _orderRepo.Setup(x => x.AddOrderItemAsync(It.IsAny<OrderItem>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _orderRepo.Setup(x => x.AddAuditLogAsync(It.IsAny<AuditLog>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _orderRepo.Setup(x => x.AddPrintJobAsync(It.IsAny<PrintJob>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _orderRepo.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
    }

    [Fact]
    public async Task CreateAsync_DuplicateActiveOrder_ThrowsConflictException()
    {
        var tableId = Guid.NewGuid();
        _tableRepo.Setup(x => x.GetByIdAsync(tableId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RestaurantTable { Id = tableId });
        _orderRepo.Setup(x => x.GetActiveOrderByTableAsync(tableId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Order { Id = Guid.NewGuid(), TableId = tableId });

        var service = CreateService();
        var request = new CreateOrderRequest(tableId);

        var act = () => service.CreateAsync(request);

        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("Table already has an active order.");
    }

    [Fact]
    public async Task CancelItemAsync_SentItem_ThrowsConflictException()
    {
        var itemId = Guid.NewGuid();
        var item = new OrderItem
        {
            Id = itemId,
            Status = OrderItemStatus.SentToKitchen,
            OrderId = Guid.NewGuid()
        };
        _orderRepo.Setup(x => x.GetItemByIdAsync(itemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(item);

        var service = CreateService();
        var request = new CancelOrderItemRequest("Wrong item");

        var act = () => service.CancelItemAsync(itemId, request);

        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("Only pending item can be cancelled.");
    }

    [Fact]
    public async Task AddItemAsync_OrderNotEditable_ThrowsBusinessException()
    {
        var orderId = Guid.NewGuid();
        var menuItemId = Guid.NewGuid();
        var order = new Order
        {
            Id = orderId,
            Status = OrderStatus.Paid,
            Items = new List<OrderItem>()
        };
        _orderRepo.Setup(x => x.GetByIdAsync(orderId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        var service = CreateService();
        var request = new AddOrderItemRequest(menuItemId, 1);

        var act = () => service.AddItemAsync(orderId, request);

        await act.Should().ThrowAsync<BusinessException>()
            .WithMessage("Order cannot be edited.");
    }
}
