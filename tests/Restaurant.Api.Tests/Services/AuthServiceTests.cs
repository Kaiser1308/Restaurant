using Microsoft.Extensions.Options;
using Restaurant.Api.Domain.Entities;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.DTOs.Auth;
using Restaurant.Api.Infrastructure.Auth;
using Restaurant.Api.Repositories;
using Restaurant.Api.Services;

namespace Restaurant.Api.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IAuthRepository> _authRepo = new();
    private readonly Mock<IJwtTokenService> _jwtService = new();
    private readonly IOptions<JwtOptions> _jwtOptions = Options.Create(new JwtOptions { RefreshTokenDays = 7 });

    private AuthService CreateService() => new(
        _authRepo.Object,
        _jwtService.Object,
        _jwtOptions);

    [Fact]
    public async Task RefreshAsync_ValidToken_RotatesRefreshToken()
    {
        var rawToken = "some-refresh-token";
        var tokenHash = "hashed-token";
        var newRawToken = "new-refresh-token";
        var newTokenHash = "new-hashed-token";
        var accessToken = "access-token";

        var user = new User
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            IsActive = true,
            Username = "owner",
            Name = "Owner",
            Role = UserRole.Owner
        };

        var storedToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(1),
            RevokedAt = null,
            User = user
        };

        _jwtService.Setup(x => x.HashRefreshToken(rawToken)).Returns(tokenHash);
        _authRepo.Setup(x => x.GetRefreshTokenByHashAsync(tokenHash, It.IsAny<CancellationToken>()))
            .ReturnsAsync(storedToken);
        _jwtService.Setup(x => x.CreateRefreshToken()).Returns(newRawToken);
        _jwtService.Setup(x => x.HashRefreshToken(newRawToken)).Returns(newTokenHash);
        _authRepo.Setup(x => x.AddRefreshTokenAsync(It.IsAny<RefreshToken>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _authRepo.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _jwtService.Setup(x => x.CreateAccessToken(user)).Returns(accessToken);

        var service = CreateService();
        var request = new RefreshTokenRequest(rawToken);

        var result = await service.RefreshAsync(request);

        result.AccessToken.Should().Be(accessToken);
        result.RefreshToken.Should().Be(newRawToken);
        storedToken.RevokedAt.Should().NotBeNull();

        _authRepo.Verify(x => x.AddRefreshTokenAsync(
            It.Is<RefreshToken>(t => t.TokenHash == newTokenHash && t.UserId == user.Id),
            It.IsAny<CancellationToken>()), Times.Once);
        _authRepo.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
