namespace Restaurant.Api.DTOs.Auth;

public sealed record AuthUserResponse(
    Guid Id,
    Guid? TenantId,
    string Name,
    string Username,
    string Role);
