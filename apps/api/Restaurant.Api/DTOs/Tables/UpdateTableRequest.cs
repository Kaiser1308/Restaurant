namespace Restaurant.Api.DTOs.Tables;

public sealed record UpdateTableRequest(
    string Name,
    string Status);
