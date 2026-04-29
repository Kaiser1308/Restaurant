using FluentValidation;
using Restaurant.Api.DTOs.Tables;

namespace Restaurant.Api.Validators;

public sealed class CreateTableRequestValidator : AbstractValidator<CreateTableRequest>
{
    public CreateTableRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
