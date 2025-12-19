using FluentValidation.Results;

public class ValidationException : Exception
{
    public List<ValidationFailure> Errors { get; }

    public ValidationException(List<ValidationFailure> failures)
        : base("Validation failed")
    {
        Errors = failures;
    }
}