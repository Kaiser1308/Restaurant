using FluentValidation;
using Restaurant.Api.DTOs.Orders;

namespace Restaurant.Api.Validators;

public sealed class CancelOrderItemRequestValidator : AbstractValidator<CancelOrderItemRequest>
{
    public CancelOrderItemRequestValidator()
    {
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(1000);
    }
}
