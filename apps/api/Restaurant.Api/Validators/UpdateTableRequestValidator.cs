using FluentValidation;
using Restaurant.Api.DTOs.Tables;

namespace Restaurant.Api.Validators;

public sealed class UpdateTableRequestValidator : AbstractValidator<UpdateTableRequest>
{
    public UpdateTableRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Status).NotEmpty();
    }
}
