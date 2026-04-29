using Restaurant.Api.Domain.Entities;

namespace Restaurant.Api.Infrastructure.Auth;

public interface IJwtTokenService
{
    string CreateAccessToken(User user);
    string CreateRefreshToken();
    string HashRefreshToken(string refreshToken);
}
