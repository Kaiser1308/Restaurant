using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace Restaurant.Api.Infrastructure.Storage;

public sealed class MinioObjectStorageService(
    IMinioClient minioClient,
    IOptions<StorageOptions> options) : IObjectStorageService
{
    private readonly StorageOptions storageOptions = options.Value;

    public async Task PutAsync(string objectKey, Stream content, string contentType, CancellationToken cancellationToken = default)
    {
        var bucketExists = await minioClient.BucketExistsAsync(
            new BucketExistsArgs().WithBucket(storageOptions.BucketName),
            cancellationToken);

        if (!bucketExists)
        {
            await minioClient.MakeBucketAsync(
                new MakeBucketArgs().WithBucket(storageOptions.BucketName),
                cancellationToken);
        }

        await minioClient.PutObjectAsync(
            new PutObjectArgs()
                .WithBucket(storageOptions.BucketName)
                .WithObject(objectKey)
                .WithStreamData(content)
                .WithObjectSize(content.Length)
                .WithContentType(contentType),
            cancellationToken);
    }

    public async Task DeleteAsync(string objectKey, CancellationToken cancellationToken = default)
    {
        await minioClient.RemoveObjectAsync(
            new RemoveObjectArgs()
                .WithBucket(storageOptions.BucketName)
                .WithObject(objectKey),
            cancellationToken);
    }

    public Task<string> GetPresignedReadUrlAsync(string objectKey, TimeSpan ttl, CancellationToken cancellationToken = default)
    {
        var expires = (int)Math.Clamp(ttl.TotalSeconds, 60, 604800);
        return minioClient.PresignedGetObjectAsync(
            new PresignedGetObjectArgs()
                .WithBucket(storageOptions.BucketName)
                .WithObject(objectKey)
                .WithExpiry(expires));
    }
}
