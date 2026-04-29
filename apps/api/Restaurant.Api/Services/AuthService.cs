using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Restaurant.Api.Common.Exceptions;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.DTOs.Auth;
using Restaurant.Api.Infrastructure.Auth;
using Restaurant.Api.Repositories;

namespace Restaurant.Api.Services;

public sealed class AuthService(
    IAuthRepository authRepository,
    IJwtTokenService jwtTokenService,
    IOptions<JwtOptions> jwtOptions) : IAuthService
{
    private readonly PasswordHasher<User> _passwordHasher = new();
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await authRepository.GetUserByUsernameAsync(request.Username.Trim(), cancellationToken);
        if (user is null)
        {
            throw new UnauthorizedException("Invalid username or password.");
        }

        if (!user.IsActive)
        {
            throw new ForbiddenException("User account is inactive.");
        }

        var passwordResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (passwordResult == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException("Invalid username or password.");
        }

        var refreshToken = await IssueRefreshTokenAsync(user, cancellationToken);
        await authRepository.SaveChangesAsync(cancellationToken);

        return new AuthResponse(
            jwtTokenService.CreateAccessToken(user),
            refreshToken,
            ToAuthUser(user, includeTenantId: false));
    }

    public async Task<RefreshTokenResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        var tokenHash = jwtTokenService.HashRefreshToken(request.RefreshToken);
        var storedToken = await authRepository.GetRefreshTokenByHashAsync(tokenHash, cancellationToken);
        var now = DateTimeOffset.UtcNow;

        if (storedToken is null || storedToken.ExpiresAt <= now || storedToken.RevokedAt is not null)
        {
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }

        var user = storedToken.User;
        if (!user.IsActive)
        {
            throw new ForbiddenException("User account is inactive.");
        }

        storedToken.RevokedAt = now;
        var newRefreshToken = await IssueRefreshTokenAsync(user, cancellationToken);
        await authRepository.SaveChangesAsync(cancellationToken);

        return new RefreshTokenResponse(
            jwtTokenService.CreateAccessToken(user),
            newRefreshToken);
    }

    public async Task LogoutAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await authRepository.RevokeActiveRefreshTokensForUserAsync(userId, DateTimeOffset.UtcNow, cancellationToken);
        await authRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<AuthUserResponse> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await authRepository.GetUserByIdAsync(userId, cancellationToken);
        if (user is null || !user.IsActive)
        {
            throw new UnauthorizedException();
        }

        return ToAuthUser(user, includeTenantId: true);
    }

    private async Task<string> IssueRefreshTokenAsync(User user, CancellationToken cancellationToken)
    {
        var refreshToken = jwtTokenService.CreateRefreshToken();
        var tokenHash = jwtTokenService.HashRefreshToken(refreshToken);

        await authRepository.AddRefreshTokenAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            TenantId = user.TenantId,
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(_jwtOptions.RefreshTokenDays),
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        return refreshToken;
    }

    private static AuthUserResponse ToAuthUser(User user, bool includeTenantId)
    {
        return new AuthUserResponse(
            user.Id,
            includeTenantId ? user.TenantId : null,
            user.Name,
            user.Username,
            user.Role.ToString());
    }
}
