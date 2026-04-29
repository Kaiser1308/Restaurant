using Serilog;
using Restaurant.Api.Middleware;
using Microsoft.EntityFrameworkCore;
using Restaurant.Api.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration));

builder.Services.AddOpenApi();

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
builder.Services.AddDbContext<RestaurantDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.UseSnakeCaseNamingConvention();
});
builder.Services.AddScoped<SeedService>();

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

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new
{
    success = true,
    message = "Restaurant API is running"
}));

app.Run();
