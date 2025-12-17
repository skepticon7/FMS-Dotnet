namespace UserService.Application.Common.Exceptions;

public class InvalidCredentialsException(string message) : Exception(message);