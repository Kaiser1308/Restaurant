using System.Text.Json;
using Restaurant.Api.Common.Exceptions;

namespace Restaurant.Api.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning(ex, "Business rule violation: {Message}", ex.Message);
            await WriteProblemResponse(context, ex.StatusCode, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await WriteProblemResponse(context, 500, "An unexpected error occurred.");
        }
    }

    private static async Task WriteProblemResponse(HttpContext context, int statusCode, string detail)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var response = new
        {
            type = $"https://restaurant/errors/{statusCode}",
            title = statusCode switch
            {
                400 => "Validation failed",
                401 => "Unauthorized",
                403 => "Forbidden",
                404 => "Not found",
                409 => "Conflict",
                _ => "Error"
            },
            status = statusCode,
            detail
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
