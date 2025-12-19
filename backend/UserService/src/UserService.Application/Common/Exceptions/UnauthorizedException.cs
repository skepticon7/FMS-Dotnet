namespace UserService.Application.Common.Exceptions;

public class UnauthorizedException(string message) : Exception(message);