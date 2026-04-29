using FluentValidation;
using Restaurant.Api.DTOs.Orders;

namespace Restaurant.Api.Validators;

public sealed class AddOrderItemRequestValidator : AbstractValidator<AddOrderItemRequest>
{
    public AddOrderItemRequestValidator()
    {
        RuleFor(x => x.MenuItemId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}
