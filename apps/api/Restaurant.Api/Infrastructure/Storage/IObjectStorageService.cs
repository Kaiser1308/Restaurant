namespace Restaurant.Api.Infrastructure.Storage;

public interface IObjectStorageService
{
    Task PutAsync(string objectKey, Stream content, string contentType, CancellationToken cancellationToken = default);
    Task DeleteAsync(string objectKey, CancellationToken cancellationToken = default);
    Task<string> GetPresignedReadUrlAsync(string objectKey, TimeSpan ttl, CancellationToken cancellationToken = default);
}
