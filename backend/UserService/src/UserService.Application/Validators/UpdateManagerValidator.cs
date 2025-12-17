using FluentValidation;
using UserService.Application.Features.Managers.Commands.UpdateManager;

namespace UserService.Application.Validators;

public class UpdateManagerValidator : AbstractValidator<UpdateManagerCommand>
{
    public UpdateManagerValidator()
    {
        RuleSet("Update" , () =>
        {
            RuleFor(x => x.FirstName).NotEmpty().WithMessage("First name is required.").When(x => x.FirstName != null);
            RuleFor(x => x.LastName).NotEmpty().WithMessage("Last name is required.").When(x => x.LastName != null);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Email is required and must be valid.").When(x => x.Email != null);;
            RuleFor(x => x.BirthDate)
                .Must(d => d < DateOnly.FromDateTime(DateTime.Now))
                .WithMessage("Birth date must be in the past.")
                .When(x => x.BirthDate.HasValue);
            RuleFor(x => x.OfficeNo).NotEmpty().WithMessage("Office number is required.").When(x => x.OfficeNo != null);;
            RuleFor(x => x.Gender).NotEmpty().WithMessage("Gender is required.").When(x => x.Gender != null);;
            RuleFor(x => x.PhoneNumber)
                .Matches(@"^(\+212|0)([ \-]?[5-7]\d{8})$")
                .WithMessage("Invalid Phone number").When(x => x.PhoneNumber != null);;
        });
    }
}