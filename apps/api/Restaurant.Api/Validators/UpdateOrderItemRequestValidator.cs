using FluentValidation;
using Restaurant.Api.DTOs.Orders;

namespace Restaurant.Api.Validators;

public sealed class UpdateOrderItemRequestValidator : AbstractValidator<UpdateOrderItemRequest>
{
    public UpdateOrderItemRequestValidator()
    {
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}
