using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Restaurant.Api.DTOs.Auth;
using Restaurant.Api.Infrastructure.Auth;
using Restaurant.Api.Services;

namespace Restaurant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(
    IAuthService authService,
    ITenantContext tenantContext,
    IValidator<LoginRequest> loginValidator,
    IValidator<RefreshTokenRequest> refreshTokenValidator) : ControllerBase
{
    [HttpPost("login")]
    [EnableRateLimiting("Login")]
    public async Task<ActionResult<AuthResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        await loginValidator.ValidateAndThrowAsync(request, cancellationToken);
        var response = await authService.LoginAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<RefreshTokenResponse>> Refresh(
        RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        await refreshTokenValidator.ValidateAndThrowAsync(request, cancellationToken);
        var response = await authService.RefreshAsync(request, cancellationToken);
        return Ok(response);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        await authService.LogoutAsync(GetCurrentUserId(), cancellationToken);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<AuthUserResponse>> Me(CancellationToken cancellationToken)
    {
        var response = await authService.GetCurrentUserAsync(GetCurrentUserId(), cancellationToken);
        return Ok(response);
    }

    [Authorize(Policy = "OwnerOnly")]
    [HttpGet("access/owner")]
    public IActionResult OwnerOnlyAccess()
    {
        return Ok(new { policy = "OwnerOnly", success = true });
    }

    [Authorize(Policy = "OwnerOrManager")]
    [HttpGet("access/owner-manager")]
    public IActionResult OwnerOrManagerAccess()
    {
        return Ok(new { policy = "OwnerOrManager", success = true });
    }

    [Authorize(Policy = "CashierOrAbove")]
    [HttpGet("access/cashier")]
    public IActionResult CashierOrAboveAccess()
    {
        return Ok(new { policy = "CashierOrAbove", success = true });
    }

    [Authorize(Policy = "WaiterOrAbove")]
    [HttpGet("access/waiter")]
    public IActionResult WaiterOrAboveAccess()
    {
        return Ok(new { policy = "WaiterOrAbove", success = true });
    }

    private Guid GetCurrentUserId()
    {
        if (tenantContext.IsAuthenticated && tenantContext.UserId.HasValue)
        {
            return tenantContext.UserId.Value;
        }

        throw new UnauthorizedAccessException("Invalid access token.");
    }
}
