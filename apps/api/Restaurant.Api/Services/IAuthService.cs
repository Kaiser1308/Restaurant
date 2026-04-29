using Restaurant.Api.DTOs.Auth;

namespace Restaurant.Api.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<RefreshTokenResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);
    Task LogoutAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<AuthUserResponse> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
