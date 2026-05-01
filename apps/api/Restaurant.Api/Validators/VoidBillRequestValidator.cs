using FluentValidation;
using Restaurant.Api.DTOs.Bills;

namespace Restaurant.Api.Validators;

public sealed class VoidBillRequestValidator : AbstractValidator<VoidBillRequest>
{
    public VoidBillRequestValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty()
            .MaximumLength(1000);
    }
}
