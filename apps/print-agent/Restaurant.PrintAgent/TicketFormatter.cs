using System.Text;
using System.Text.Json;

namespace Restaurant.PrintAgent;

public class TicketFormatter
{
    public string Format(PrintJobResponse job)
    {
        var sb = new StringBuilder();
        sb.AppendLine("================================");
        sb.AppendLine($"  PRINTER: {job.PrinterType.ToUpperInvariant()}");
        sb.AppendLine("================================");

        using var doc = JsonDocument.Parse(job.ContentJson);
        var root = doc.RootElement;

        if (TryGetProperty(root, out var tableName, "TableName", "tableName"))
        {
            sb.AppendLine($"Table: {GetDisplayValue(tableName)}");
        }

        if (TryGetProperty(root, out var orderId, "OrderId", "orderId"))
        {
            sb.AppendLine($"Order: {GetDisplayValue(orderId)}");
        }

        if (TryGetProperty(root, out var billNumber, "BillNumber", "billNumber"))
        {
            sb.AppendLine($"Bill: {GetDisplayValue(billNumber)}");
        }

        if (TryGetProperty(root, out var paymentType, "PaymentType", "paymentType"))
        {
            sb.AppendLine($"Payment: {GetDisplayValue(paymentType)}");
        }

        sb.AppendLine("--------------------------------");

        if (TryGetProperty(root, out var items, "Items", "items") && items.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in items.EnumerateArray())
            {
                var quantity = TryGetProperty(item, out var q, "Quantity", "quantity")
                    ? GetQuantity(q)
                    : 1;
                var name = TryGetProperty(item, out var itemName, "ItemNameSnapshot", "itemName", "ItemName")
                    ? GetDisplayValue(itemName)
                    : "Unknown Item";

                sb.AppendLine($"  {quantity}x {name}");
            }
        }
        else if (TryGetProperty(root, out var itemName, "ItemNameSnapshot", "itemName", "ItemName"))
        {
            var quantity = TryGetProperty(root, out var q, "Quantity", "quantity")
                ? GetQuantity(q)
                : 1;
            sb.AppendLine($"  {quantity}x {GetDisplayValue(itemName)}");
        }

        sb.AppendLine("--------------------------------");

        if (TryGetProperty(root, out var total, "TotalAmount", "totalAmount") && TryGetDecimal(total, out var amount))
        {
            sb.AppendLine($"  TOTAL: {amount:N0} VND");
        }

        if (TryGetProperty(root, out var sentAt, "SentAt", "sentAt"))
        {
            sb.AppendLine($"Sent: {GetDisplayValue(sentAt)}");
        }

        if (TryGetProperty(root, out var paidAt, "PaidAt", "paidAt"))
        {
            sb.AppendLine($"Paid: {GetDisplayValue(paidAt)}");
        }

        if (TryGetProperty(root, out var reason, "Reason", "reason"))
        {
            sb.AppendLine($"Reason: {GetDisplayValue(reason)}");
        }

        if (TryGetProperty(root, out var cancelledAt, "CancelledAt", "cancelledAt"))
        {
            sb.AppendLine($"Cancelled: {GetDisplayValue(cancelledAt)}");
        }

        sb.AppendLine("================================");

        return sb.ToString();
    }

    private static bool TryGetProperty(JsonElement element, out JsonElement value, params string[] names)
    {
        foreach (var name in names)
        {
            if (element.TryGetProperty(name, out value))
            {
                return true;
            }
        }

        value = default;
        return false;
    }

    private static string GetDisplayValue(JsonElement element)
    {
        return element.ValueKind == JsonValueKind.String
            ? element.GetString() ?? string.Empty
            : element.ToString();
    }

    private static int GetQuantity(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.Number && element.TryGetInt32(out var quantity))
        {
            return quantity;
        }

        return element.ValueKind == JsonValueKind.String && int.TryParse(element.GetString(), out quantity)
            ? quantity
            : 1;
    }

    private static bool TryGetDecimal(JsonElement element, out decimal value)
    {
        if (element.ValueKind == JsonValueKind.Number)
        {
            return element.TryGetDecimal(out value);
        }

        if (element.ValueKind == JsonValueKind.String && decimal.TryParse(element.GetString(), out value))
        {
            return true;
        }

        value = default;
        return false;
    }
}
