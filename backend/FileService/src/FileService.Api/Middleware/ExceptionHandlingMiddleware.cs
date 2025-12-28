using System.Net;
using System.Text.Json;
using FileService.Application.Common.Exceptions;

namespace FileService.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";

            var response = new
            {
                type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                title = "One or more validation errors occurred.",
                status = 400,
                errors = ex.Errors
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
        catch (NotFoundException ex)
        {
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;
            context.Response.ContentType = "application/json";

            var response = new
            {
                status = 404,
                message = ex.Message
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
        catch (Exception)
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "application/json";

            var response = new
            {
                status = 500,
                message = "An unexpected error occurred"
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}