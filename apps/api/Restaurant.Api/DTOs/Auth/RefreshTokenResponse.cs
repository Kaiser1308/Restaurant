namespace Restaurant.Api.DTOs.Auth;

public sealed record RefreshTokenResponse(
    string AccessToken,
    string RefreshToken);
