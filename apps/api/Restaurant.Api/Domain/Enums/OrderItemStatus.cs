namespace Restaurant.Api.Domain.Enums;

public enum OrderItemStatus
{
    Pending,
    SentToKitchen,
    Cancelled,
    Cooking,
    Ready,
    Served
}
