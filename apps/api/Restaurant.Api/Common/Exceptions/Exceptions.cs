namespace Restaurant.Api.Common.Exceptions;

public class BusinessException : Exception
{
    public int StatusCode { get; }

    public BusinessException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}

public class NotFoundException : BusinessException
{
    public NotFoundException(string message = "Resource not found") : base(message, 404) { }
}

public class ConflictException : BusinessException
{
    public ConflictException(string message) : base(message, 409) { }
}

public class ForbiddenException : BusinessException
{
    public ForbiddenException(string message = "You do not have permission") : base(message, 403) { }
}

public class UnauthorizedException : BusinessException
{
    public UnauthorizedException(string message = "Unauthorized") : base(message, 401) { }
}
