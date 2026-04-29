namespace Restaurant.Api.Common.Result;

public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }
    public int StatusCode { get; }

    private Result(T value)
    {
        IsSuccess = true;
        Value = value;
        StatusCode = 200;
    }

    private Result(string error, int statusCode)
    {
        IsSuccess = false;
        Error = error;
        StatusCode = statusCode;
    }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(string error, int statusCode = 400) => new(error, statusCode);
    public static Result<T> NotFound(string error = "Not found") => new(error, 404);
    public static Result<T> Unauthorized(string error = "Unauthorized") => new(error, 401);
    public static Result<T> Forbidden(string error = "Forbidden") => new(error, 403);
    public static Result<T> Conflict(string error) => new(error, 409);
}

public class Result
{
    public bool IsSuccess { get; }
    public string? Error { get; }
    public int StatusCode { get; }

    private Result(int statusCode)
    {
        IsSuccess = true;
        StatusCode = statusCode;
    }

    private Result(string error, int statusCode)
    {
        IsSuccess = false;
        Error = error;
        StatusCode = statusCode;
    }

    public static Result Success() => new(200);
    public static Result Failure(string error, int statusCode = 400) => new(error, statusCode);
    public static Result NotFound(string error = "Not found") => new(error, 404);
    public static Result Unauthorized(string error = "Unauthorized") => new(error, 401);
    public static Result Forbidden(string error = "Forbidden") => new(error, 403);
    public static Result Conflict(string error) => new(error, 409);
}
