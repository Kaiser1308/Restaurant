namespace Restaurant.Api.DTOs.Auth;

public sealed record AuthResponse(
    string AccessToken,
    string RefreshToken,
    AuthUserResponse User);
