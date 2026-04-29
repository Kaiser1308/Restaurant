using System.Text.Json;
using FluentValidation;
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
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed: {Message}", ex.Message);
            await WriteProblemResponse(context, 400, ex.Errors.FirstOrDefault()?.ErrorMessage ?? "Validation failed.");
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized request: {Message}", ex.Message);
            await WriteProblemResponse(context, 401, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await WriteProblemResponse(context, 500, "An unexpected error occurred.");
        }
    }

    private static async Task WriteProblemResponse(HttpContext context, int statusCode, string detail)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

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
                429 => "Too many requests",
                500 => "Internal server error",
                _ => "Error"
            },
            status = statusCode,
            detail,
            traceId = context.TraceIdentifier
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
