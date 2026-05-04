using System.Text.Json;
using Restaurant.Api.Common.Exceptions;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.DTOs.Orders;
using Restaurant.Api.Infrastructure.Auth;
using Restaurant.Api.Repositories;

namespace Restaurant.Api.Services;

public sealed class OrderService(
    IOrderRepository orderRepository,
    ITableRepository tableRepository,
    IMenuItemRepository menuItemRepository,
    ITenantContext tenantContext) : IOrderService
{
    public async Task<CreateOrderResponse> CreateAsync(CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        var table = await tableRepository.GetByIdAsync(request.TableId, cancellationToken) ?? throw new NotFoundException("Table not found.");
        var activeOrder = await orderRepository.GetActiveOrderByTableAsync(request.TableId, cancellationToken);
        if (activeOrder is not null)
        {
            throw new ConflictException("Table already has an active order.");
        }

        var now = DateTimeOffset.UtcNow;
        var order = new Order
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.RequireTenantId(),
            TableId = table.Id,
            CreatedByUserId = tenantContext.RequireUserId(),
            Status = OrderStatus.Pending,
            CreatedAt = now,
            UpdatedAt = now
        };
        table.Status = TableStatus.Occupied;
        table.UpdatedAt = now;
        await orderRepository.AddOrderAsync(order, cancellationToken);
        await AddAuditAsync("create_order", "order", order.Id, null, cancellationToken);
        await orderRepository.SaveChangesAsync(cancellationToken);

        return new CreateOrderResponse(order.Id, order.TableId, order.Status.ToString(), order.CreatedAt);
    }

    public async Task<OrderDetailResponse> GetDetailAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetOrderDetailAsync(orderId, cancellationToken) ?? throw new NotFoundException("Order not found.");
        return Map(order);
    }

    public async Task<OrderDetailResponse?> GetActiveByTableAsync(Guid tableId, CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetActiveOrderByTableAsync(tableId, cancellationToken);
        return order is null ? null : Map(order);
    }

    public async Task<OrderDetailResponse> AddItemAsync(Guid orderId, AddOrderItemRequest request, CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetByIdAsync(orderId, cancellationToken) ?? throw new NotFoundException("Order not found.");
        if (order.Status is not (OrderStatus.Pending or OrderStatus.SentToKitchen))
        {
            throw new BusinessException("Order cannot be edited.");
        }

        var menuItem = await menuItemRepository.GetByIdAsync(request.MenuItemId, cancellationToken) ?? throw new NotFoundException("Menu item not found.");
        if (!menuItem.IsAvailable || !menuItem.IsActive)
        {
            throw new BusinessException("Menu item is unavailable.", 409);
        }

        var now = DateTimeOffset.UtcNow;
        var item = new OrderItem
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.RequireTenantId(),
            OrderId = order.Id,
            MenuItemId = menuItem.Id,
            ItemNameSnapshot = menuItem.Name,
            Quantity = request.Quantity,
            UnitPrice = menuItem.Price,
            Status = OrderItemStatus.Pending,
            CreatedAt = now,
            UpdatedAt = now
        };

        await orderRepository.AddOrderItemAsync(item, cancellationToken);
        order.UpdatedAt = now;
        await AddAuditAsync("add_order_item", "order_item", item.Id, null, cancellationToken);
        await orderRepository.SaveChangesAsync(cancellationToken);

        var updated = await orderRepository.GetOrderDetailAsync(order.Id, cancellationToken) ?? throw new NotFoundException("Order not found.");
        return Map(updated);
    }

    public async Task<OrderDetailResponse> UpdateItemAsync(Guid itemId, UpdateOrderItemRequest request, CancellationToken cancellationToken = default)
    {
        var item = await orderRepository.GetItemByIdAsync(itemId, cancellationToken) ?? throw new NotFoundException("Order item not found.");
        if (item.Status != OrderItemStatus.Pending)
        {
            throw new ConflictException("Only pending item can be updated.");
        }

        item.Quantity = request.Quantity;
        item.UpdatedAt = DateTimeOffset.UtcNow;
        await AddAuditAsync("update_order_item_qty", "order_item", item.Id, null, cancellationToken);
        await orderRepository.SaveChangesAsync(cancellationToken);

        var order = await orderRepository.GetOrderDetailAsync(item.OrderId, cancellationToken) ?? throw new NotFoundException("Order not found.");
        return Map(order);
    }

    public async Task<OrderDetailResponse> CancelItemAsync(Guid itemId, CancelOrderItemRequest request, CancellationToken cancellationToken = default)
    {
        var item = await orderRepository.GetItemByIdAsync(itemId, cancellationToken) ?? throw new NotFoundException("Order item not found.");
        if (item.Status is not (OrderItemStatus.Pending or OrderItemStatus.SentToKitchen))
        {
            throw new ConflictException("Only pending or sent-to-kitchen item can be cancelled.");
        }

        var wasSentToKitchen = item.Status == OrderItemStatus.SentToKitchen;
        var now = DateTimeOffset.UtcNow;
        item.Status = OrderItemStatus.Cancelled;
        item.CancelReason = request.Reason.Trim();
        item.CancelledByUserId = tenantContext.RequireUserId();
        item.CancelledAt = now;
        item.UpdatedAt = now;

        if (wasSentToKitchen)
        {
            var content = new
            {
                tableName = item.Order.Table.Name,
                orderId = item.OrderId,
                itemName = item.ItemNameSnapshot,
                quantity = item.Quantity,
                reason = item.CancelReason,
                cancelledAt = now
            };

            var printJob = new PrintJob
            {
                Id = Guid.NewGuid(),
                TenantId = tenantContext.RequireTenantId(),
                EntityType = "order_item_cancel",
                EntityId = item.Id,
                PrinterType = PrinterType.KitchenCancel,
                PrintKey = $"kitchen_cancel:{item.OrderId}:{item.Id}:{now:yyyyMMddHHmmssfffffff}",
                Status = PrintJobStatus.Pending,
                ContentJson = JsonSerializer.Serialize(content),
                CreatedAt = now,
                UpdatedAt = now
            };

            await orderRepository.AddPrintJobAsync(printJob, cancellationToken);
        }

        await AddAuditAsync("cancel_order_item", "order_item", item.Id, item.CancelReason, cancellationToken);
        await orderRepository.SaveChangesAsync(cancellationToken);

        var order = await orderRepository.GetOrderDetailAsync(item.OrderId, cancellationToken) ?? throw new NotFoundException("Order not found.");
        return Map(order);
    }

    public async Task<SendToKitchenResponse> SendToKitchenAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetByIdAsync(orderId, cancellationToken) ?? throw new NotFoundException("Order not found.");
        var pendingItems = order.Items.Where(x => x.Status == OrderItemStatus.Pending).ToList();
        if (pendingItems.Count == 0)
        {
            throw new BusinessException("Order has no pending items.", 409);
        }

        var now = DateTimeOffset.UtcNow;
        if (order.Status != OrderStatus.SentToKitchen)
        {
            order.Status = OrderStatus.SentToKitchen;
            order.SentToKitchenAt = now;
        }

        foreach (var item in pendingItems)
        {
            item.Status = OrderItemStatus.SentToKitchen;
            item.SentToKitchenAt = now;
            item.UpdatedAt = now;
        }

        var content = new
        {
            TableName = order.Table.Name,
            OrderId = order.Id,
            SentAt = now,
            Items = pendingItems.Select(x => new
            {
                x.ItemNameSnapshot,
                x.Quantity,
                x.UnitPrice,
                LineTotal = x.UnitPrice * x.Quantity
            }).ToList()
        };

        var printJob = new PrintJob
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.RequireTenantId(),
            EntityType = "order",
            EntityId = order.Id,
            PrinterType = PrinterType.Kitchen,
            PrintKey = $"kitchen:{order.Id}:{now:yyyyMMddHHmmssfffffff}",
            Status = PrintJobStatus.Pending,
            ContentJson = JsonSerializer.Serialize(content),
            CreatedAt = now,
            UpdatedAt = now
        };

        order.UpdatedAt = now;
        await orderRepository.AddPrintJobAsync(printJob, cancellationToken);
        await AddAuditAsync("send_to_kitchen", "order", order.Id, null, cancellationToken);
        await orderRepository.SaveChangesAsync(cancellationToken);
        return new SendToKitchenResponse(order.Id, order.Status.ToString(), printJob.Id);
    }

    private async Task AddAuditAsync(string action, string entityType, Guid entityId, string? reason, CancellationToken cancellationToken)
    {
        var log = new AuditLog
        {
            Id = Guid.NewGuid(),
            TenantId = tenantContext.RequireTenantId(),
            UserId = tenantContext.RequireUserId(),
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Reason = reason,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await orderRepository.AddAuditLogAsync(log, cancellationToken);
    }

    private static OrderDetailResponse Map(Order order)
    {
        var items = order.Items
            .OrderBy(x => x.CreatedAt)
            .Select(x => new OrderItemResponse(
                x.Id,
                x.MenuItemId,
                x.ItemNameSnapshot,
                x.Quantity,
                x.UnitPrice,
                x.UnitPrice * x.Quantity,
                x.Status.ToString(),
                x.CancelReason))
            .ToList();

        return new OrderDetailResponse(
            order.Id,
            order.TableId,
            order.Table.Name,
            order.Status.ToString(),
            items,
            items.Where(x => x.Status != OrderItemStatus.Cancelled.ToString()).Sum(x => x.LineTotal),
            order.CreatedAt);
    }
}
