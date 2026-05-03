namespace Restaurant.Api.Infrastructure.Storage;

public sealed class StorageOptions
{
    public string Endpoint { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;
    public bool UseSsl { get; set; }
    public int PresignedUrlTtlMinutes { get; set; } = 60;
}
