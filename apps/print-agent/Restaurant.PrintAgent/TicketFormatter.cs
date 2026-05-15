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

        if (root.TryGetProperty("TableName", out var tableName) && tableName.ValueKind == JsonValueKind.String)
        {
            sb.AppendLine($"Table: {tableName.GetString()}");
        }

        if (root.TryGetProperty("OrderId", out var orderId) && orderId.ValueKind == JsonValueKind.String)
        {
            sb.AppendLine($"Order: {orderId.GetString()}");
        }

        if (root.TryGetProperty("BillNumber", out var billNumber) && billNumber.ValueKind == JsonValueKind.String)
        {
            sb.AppendLine($"Bill: {billNumber.GetString()}");
        }

        if (root.TryGetProperty("PaymentType", out var paymentType) && paymentType.ValueKind == JsonValueKind.String)
        {
            sb.AppendLine($"Payment: {paymentType.GetString()}");
        }

        sb.AppendLine("--------------------------------");

        if (root.TryGetProperty("Items", out var items) && items.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in items.EnumerateArray())
            {
                var quantity = item.TryGetProperty("Quantity", out var q) ? q.GetInt32() : 1;
                var name = item.TryGetProperty("ItemNameSnapshot", out var ns)
                    ? ns.GetString()
                    : item.TryGetProperty("ItemName", out var nn)
                        ? nn.GetString()
                        : "Unknown Item";
                sb.AppendLine($"  {quantity}x {name}");
            }
        }

        sb.AppendLine("--------------------------------");

        if (root.TryGetProperty("TotalAmount", out var total) && total.ValueKind == JsonValueKind.Number)
        {
            sb.AppendLine($"  TOTAL: {total.GetDecimal():N0} VND");
        }

        if (root.TryGetProperty("SentAt", out var sentAt) && sentAt.ValueKind == JsonValueKind.String)
        {
            sb.AppendLine($"Sent: {sentAt.GetString()}");
        }

        if (root.TryGetProperty("PaidAt", out var paidAt) && paidAt.ValueKind == JsonValueKind.String)
        {
            sb.AppendLine($"Paid: {paidAt.GetString()}");
        }

        sb.AppendLine("================================");

        return sb.ToString();
    }
}
