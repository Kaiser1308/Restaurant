using System.Text.Json;
using Restaurant.Api.Common.Exceptions;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.DTOs.Bills;
using Restaurant.Api.Infrastructure.Auth;
using Restaurant.Api.Repositories;

namespace Restaurant.Api.Services;

public sealed class BillService(
    IBillRepository billRepository,
    IAuditLogRepository auditLogRepository,
    IPermissionService permissionService,
    ITenantContext tenantContext) : IBillService
{
    public async Task<BillPreviewResponse> PreviewOrderAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        var order = await billRepository.GetOrderForPaymentAsync(orderId, cancellationToken) ?? throw new NotFoundException("Order not found.");
        var items = MapPreviewItems(order);
        return new BillPreviewResponse(order.Id, order.TableId, order.Table.Name, order.Status.ToString(), items.Sum(x => x.LineTotal), items);
    }

    public async Task<PayOrderResponse> PayOrderAsync(Guid orderId, PayOrderRequest request, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<PaymentType>(request.PaymentType, true, out var paymentType))
        {
            throw new BusinessException("Invalid payment type.");
        }

        await using var transaction = await billRepository.BeginTransactionAsync(cancellationToken);
        var order = await billRepository.GetOrderForPaymentAsync(orderId, cancellationToken) ?? throw new NotFoundException("Order not found.");
        if (order.Bill is not null)
        {
            throw new ConflictException("Order already has a bill.");
        }

        var payableItems = order.Items.Where(x => x.Status != OrderItemStatus.Cancelled).ToList();
        if (payableItems.Count == 0)
        {
            throw new BusinessException("Order has no payable items.", 409);
        }

        if (payableItems.Any(x => x.Status != OrderItemStatus.SentToKitchen))
        {
            throw new BusinessException("All payable items must be sent to kitchen before payment.", 409);
        }

        var tenantId = tenantContext.RequireTenantId();
        var userId = tenantContext.RequireUserId();
        var now = DateTimeOffset.UtcNow;
        var billNumber = await billRepository.NextBillNumberAsync(tenantId, DateOnly.FromDateTime(now.UtcDateTime), cancellationToken);
        var billItems = payableItems
            .OrderBy(x => x.CreatedAt)
            .Select(item => new BillItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                OrderItemId = item.Id,
                ItemNameSnapshot = item.ItemNameSnapshot,
                UnitPriceSnapshot = item.UnitPrice,
                Quantity = item.Quantity,
                LineTotal = item.UnitPrice * item.Quantity,
                CreatedAt = now
            })
            .ToList();

        var bill = new Bill
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            OrderId = order.Id,
            BillNumber = billNumber,
            Status = BillStatus.Paid,
            PaymentType = paymentType,
            TotalAmount = billItems.Sum(x => x.LineTotal),
            PaidByUserId = userId,
            PaidAt = now,
            CreatedAt = now,
            UpdatedAt = now,
            Items = billItems
        };

        order.Status = OrderStatus.Paid;
        order.PaidAt = now;
        order.UpdatedAt = now;
        order.Table.Status = TableStatus.Available;
        order.Table.UpdatedAt = now;

        var printJob = new PrintJob
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EntityType = "bill",
            EntityId = bill.Id,
            PrinterType = PrinterType.Cashier,
            Status = PrintJobStatus.Pending,
            PrintKey = $"cashier:{bill.Id}",
            ContentJson = JsonSerializer.Serialize(new
            {
                billNumber = bill.BillNumber,
                tableName = order.Table.Name,
                paymentType = bill.PaymentType.ToString(),
                totalAmount = bill.TotalAmount,
                paidAt = bill.PaidAt,
                items = billItems.Select(x => new
                {
                    itemName = x.ItemNameSnapshot,
                    quantity = x.Quantity,
                    unitPrice = x.UnitPriceSnapshot,
                    lineTotal = x.LineTotal
                })
            }),
            CreatedAt = now,
            UpdatedAt = now
        };

        await billRepository.AddBillAsync(bill, cancellationToken);
        await billRepository.AddPrintJobAsync(printJob, cancellationToken);
        await AddAuditAsync("pay_bill", "bill", bill.Id, null, cancellationToken);
        await billRepository.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return new PayOrderResponse(bill.Id, bill.BillNumber, bill.OrderId, bill.Status.ToString(), bill.PaymentType.ToString(), bill.TotalAmount, bill.PaidAt, printJob.Id);
    }

    public async Task<BillResponse> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var bill = await billRepository.GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException("Bill not found.");
        return Map(bill);
    }

    public async Task<IReadOnlyList<BillSummaryResponse>> ListAsync(DateOnly? date, string? status, CancellationToken cancellationToken = default)
    {
        BillStatus? parsedStatus = null;
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<BillStatus>(status, true, out var value))
            {
                throw new BusinessException("Invalid bill status.");
            }

            parsedStatus = value;
        }

        var bills = await billRepository.ListAsync(date, parsedStatus, cancellationToken);
        return bills.Select(x => new BillSummaryResponse(
                x.Id,
                x.BillNumber,
                x.OrderId,
                x.Order.Table.Name,
                x.Status.ToString(),
                x.PaymentType.ToString(),
                x.TotalAmount,
                x.PaidAt))
            .ToList();
    }

    public async Task<BillResponse> VoidAsync(Guid id, VoidBillRequest request, CancellationToken cancellationToken = default)
    {
        var role = tenantContext.RequireRole();
        if (!permissionService.CanVoidBill(role))
        {
            throw new ForbiddenException("Only owner can void bills.");
        }

        await using var transaction = await billRepository.BeginTransactionAsync(cancellationToken);
        var bill = await billRepository.GetByIdAsync(id, cancellationToken) ?? throw new NotFoundException("Bill not found.");
        if (bill.Status != BillStatus.Paid)
        {
            throw new ConflictException("Only paid bill can be voided.");
        }

        var now = DateTimeOffset.UtcNow;
        var userId = tenantContext.RequireUserId();
        var reason = request.Reason.Trim();

        bill.Status = BillStatus.Voided;
        bill.VoidedAt = now;
        bill.VoidedByUserId = userId;
        bill.UpdatedAt = now;

        var voidLog = new VoidLog
        {
            Id = Guid.NewGuid(),
            TenantId = bill.TenantId,
            BillId = bill.Id,
            UserId = userId,
            Reason = reason,
            CreatedAt = now
        };

        await billRepository.AddVoidLogAsync(voidLog, cancellationToken);
        await AddAuditAsync("void_bill", "bill", bill.Id, reason, cancellationToken);
        await billRepository.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return Map(bill);
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

        await auditLogRepository.AddAsync(log, cancellationToken);
    }

    private static IReadOnlyList<BillItemResponse> MapPreviewItems(Order order)
        => order.Items
            .Where(x => x.Status != OrderItemStatus.Cancelled)
            .OrderBy(x => x.CreatedAt)
            .Select(x => new BillItemResponse(
                x.Id,
                x.Id,
                x.ItemNameSnapshot,
                x.UnitPrice,
                x.Quantity,
                x.UnitPrice * x.Quantity))
            .ToList();

    private static BillResponse Map(Bill bill)
    {
        var voidReason = bill.VoidLogs.OrderByDescending(x => x.CreatedAt).FirstOrDefault()?.Reason;
        var items = bill.Items
            .OrderBy(x => x.CreatedAt)
            .Select(x => new BillItemResponse(
                x.Id,
                x.OrderItemId,
                x.ItemNameSnapshot,
                x.UnitPriceSnapshot,
                x.Quantity,
                x.LineTotal))
            .ToList();

        return new BillResponse(
            bill.Id,
            bill.BillNumber,
            bill.OrderId,
            bill.Order.TableId,
            bill.Order.Table.Name,
            bill.Status.ToString(),
            bill.PaymentType.ToString(),
            bill.TotalAmount,
            items,
            bill.PaidAt,
            bill.VoidedAt,
            voidReason);
    }
}
