using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Mime;
using UserService.Api.Models;
using UserService.Application.Common.Exceptions;

namespace UserService.Api.Middleware;

public class ExceptionMiddleware : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch(Exception ex)
        {
            var response = context.Response;
            response.ContentType = "application/json";

            var apiResponse = new ApiError();

            switch (ex)
            {
                case ValidationException ve:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    apiResponse.StatusCode = response.StatusCode;
                    apiResponse.Message = string.Join(" | ", ve.Errors.Select(e => e.ErrorMessage));
                    break;
                
                case NotFoundException :
                    response.StatusCode = (int)HttpStatusCode.NotFound;
                    apiResponse.StatusCode = response.StatusCode;
                    apiResponse.Message = ex.Message;
                    break;
                
                case AlreadyExistsException :
                    response.StatusCode = (int)HttpStatusCode.Conflict;
                    apiResponse.StatusCode = response.StatusCode;
                    apiResponse.Message = ex.Message;
                    break;
                
                default:
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    apiResponse.StatusCode = response.StatusCode;
                    apiResponse.Message = "Internal Server Error" + ex.Message;
                    break;
            }

            await response.WriteAsJsonAsync(apiResponse);

        }
    }
}