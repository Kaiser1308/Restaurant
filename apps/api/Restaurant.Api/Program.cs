using System.Text;
using System.Threading.RateLimiting;
using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Restaurant.Api.Domain.Enums;
using Restaurant.Api.Infrastructure.Auth;
using Restaurant.Api.Infrastructure.Persistence;
using Restaurant.Api.Middleware;
using Restaurant.Api.Repositories;
using Restaurant.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration));

var jwtOptions = ResolveJwtOptions(builder.Configuration, builder.Environment);
builder.Services.Configure<JwtOptions>(options =>
{
    options.Issuer = jwtOptions.Issuer;
    options.Audience = jwtOptions.Audience;
    options.Secret = jwtOptions.Secret;
    options.AccessTokenMinutes = jwtOptions.AccessTokenMinutes;
    options.RefreshTokenDays = jwtOptions.RefreshTokenDays;
});

builder.Services.AddOpenApi();
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Development", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Secret)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("OwnerOnly", policy =>
        policy.RequireAssertion(context => HasRoleAtLeast(context, UserRole.Owner)));
    options.AddPolicy("OwnerOrManager", policy =>
        policy.RequireAssertion(context => HasRoleAtLeast(context, UserRole.Manager)));
    options.AddPolicy("CashierOrAbove", policy =>
        policy.RequireAssertion(context => HasRoleAtLeast(context, UserRole.Cashier)));
    options.AddPolicy("WaiterOrAbove", policy =>
        policy.RequireAssertion(context => HasRoleAtLeast(context, UserRole.Waiter)));
});
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("Login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true
            }));
});
builder.Services.AddDbContext<RestaurantDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.UseSnakeCaseNamingConvention();
});
builder.Services.AddScoped<SeedService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<ITableRepository, TableRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IMenuItemRepository, MenuItemRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IBillRepository, BillRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITableService, TableService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IMenuItemService, MenuItemService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IBillService, BillService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<ITenantContext, TenantContext>();
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<RestaurantDbContext>();
    var seedService = scope.ServiceProvider.GetRequiredService<SeedService>();
    await dbContext.Database.MigrateAsync();
    await seedService.SeedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("Development");
app.UseSerilogRequestLogging();
app.UseRateLimiter();
app.UseAuthentication();
app.UseMiddleware<TenantContextMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new
{
    success = true,
    message = "Restaurant API is running"
}));

app.Run();

static bool HasRoleAtLeast(AuthorizationHandlerContext context, UserRole requiredRole)
{
    var roleClaim = context.User.FindFirst(ClaimTypes.Role)?.Value
        ?? context.User.FindFirst("role")?.Value;

    if (!Enum.TryParse<UserRole>(roleClaim, true, out var role))
    {
        return false;
    }

    return RoleAccess.IsAtLeast(role, requiredRole);
}

static JwtOptions ResolveJwtOptions(IConfiguration configuration, IHostEnvironment environment)
{
    var options = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
    options.Secret = configuration["JWT_SECRET"]
        ?? Environment.GetEnvironmentVariable("JWT_SECRET")
        ?? options.Secret;

    if (string.IsNullOrWhiteSpace(options.Secret) && environment.IsDevelopment())
    {
        options.Secret = "development-only-jwt-secret-change-before-production";
    }

    if (options.Secret.Length < 32)
    {
        throw new InvalidOperationException("JWT secret must be at least 32 characters.");
    }

    return options;
}
