using FluentValidation;
using UserService.Application.Features.Users.Commands;

namespace UserService.Application.Validators;

public class CreateDoctorCommandValidator : AbstractValidator<CreateDoctorCommand>
{
    public CreateDoctorCommandValidator()
    {
        RuleSet("Create" , () =>
        {
            RuleFor(x => x.FirstName).NotEmpty().WithMessage("First name is required.");
            RuleFor(x => x.LastName).NotEmpty().WithMessage("Last name is required.");
            RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Email is required and must be valid.");
            RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
            RuleFor(x => x.BirthDate).NotNull().WithMessage("Birth date is required").LessThan(DateTime.Now)
                .WithMessage("Birth date is invalid");
            RuleFor(x => x.Speciality).NotEmpty().WithMessage("Speciality is required.");
            RuleFor(x => x.LicenseNo).NotEmpty().WithMessage("LicenseNo is required.");
            RuleFor(x => x.Gender).NotEmpty().WithMessage("Gender is required.");
            RuleFor(x => x.PhoneNumber)
                .Matches(@"^(\+212|0)([ \-]?[5-7]\d{8})$")
                .WithMessage("Invalid Phone number");
        });
        
        RuleSet("Update" , () =>
        {
            RuleFor(x => x.FirstName).NotEmpty().WithMessage("First name is required.").When(x => x.FirstName != null);
            RuleFor(x => x.LastName).NotEmpty().WithMessage("Last name is required.").When(x => x.LastName != null);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Email is required and must be valid.").When(x => x.Email != null);;
            RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.").When(x => x.Password != null);;
            RuleFor(x => x.BirthDate).NotNull().WithMessage("Birth date is required").LessThan(DateTime.Now).WithMessage("Birth date is invalid").When(x => x.BirthDate != null);;
            RuleFor(x => x.Speciality).NotEmpty().WithMessage("Speciality is required.").When(x => x.Speciality != null);;
            RuleFor(x => x.LicenseNo).NotEmpty().WithMessage("LicenseNo is required.").When(x => x.LicenseNo != null);;
            RuleFor(x => x.Gender).NotEmpty().WithMessage("Gender is required.").When(x => x.Gender != null);;
            RuleFor(x => x.PhoneNumber)
                .Matches(@"^(\+212|0)([ \-]?[5-7]\d{8})$")
                .WithMessage("Invalid Phone number").When(x => x.PhoneNumber != null);;
        });
    }
}