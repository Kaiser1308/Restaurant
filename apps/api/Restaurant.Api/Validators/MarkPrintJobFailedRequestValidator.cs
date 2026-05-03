using FluentValidation;
using Restaurant.Api.DTOs.PrintJobs;

namespace Restaurant.Api.Validators;

public sealed class MarkPrintJobFailedRequestValidator : AbstractValidator<MarkPrintJobFailedRequest>
{
    public MarkPrintJobFailedRequestValidator()
    {
        RuleFor(x => x.ErrorMessage)
            .NotEmpty()
            .MaximumLength(2000);
    }
}
