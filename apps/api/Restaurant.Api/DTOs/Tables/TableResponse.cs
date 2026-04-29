namespace Restaurant.Api.DTOs.Tables;

public sealed record TableResponse(
    Guid Id,
    string Name,
    string Status);
