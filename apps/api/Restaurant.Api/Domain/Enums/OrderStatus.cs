namespace Restaurant.Api.Domain.Enums;

public enum OrderStatus
{
    Pending,
    SentToKitchen,
    Paid,
    Cancelled,
    Voided
}
