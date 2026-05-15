using FluentValidation;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.DTOs.Bills;

namespace Restaurant.Api.Validators;

public sealed class PayOrderRequestValidator : AbstractValidator<PayOrderRequest>
{
    public PayOrderRequestValidator()
    {
        RuleFor(x => x.PaymentType)
            .NotEmpty()
            .Must(value => Enum.TryParse<PaymentType>(value, true, out _))
            .WithMessage("Payment type must be Cash, Qr, or BankTransfer.");
    }
}
