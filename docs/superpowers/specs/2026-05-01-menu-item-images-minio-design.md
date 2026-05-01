# Menu Item Images with MinIO Design

## Status

Approved for planning.

## Goal

Add image support for menu items and store image files in MinIO. The database stores only the image object key. The API owns upload, delete, validation, and URL generation. The frontend never talks to MinIO directly.

## Decisions

- Use a private MinIO bucket.
- Return short-lived presigned URLs in API responses for displaying images.
- Store `ImageObjectKey` on `MenuItem`, not a public URL.
- Keep image upload separate from menu item create/update.
- Owner and manager roles can upload or delete menu item images.
- Waiters and above can view menu items with generated `imageUrl`.

## Data Model

`MenuItem` gains:

- `ImageObjectKey`: nullable string.

Object keys use a tenant-scoped path:

```text
tenants/{tenantId}/menu-items/{menuItemId}/{fileName}
```

The object key is tenant-scoped to avoid cross-tenant collisions and to make cleanup or migration easier later.

## API Design

Existing menu item responses add:

- `imageUrl`: nullable string, generated as a presigned URL when `ImageObjectKey` exists.

New endpoints:

```http
POST /api/menu-items/{id}/image
DELETE /api/menu-items/{id}/image
```

`POST /api/menu-items/{id}/image` accepts multipart form data with one file field named `image`.

Validation:

- Allowed content types: `image/jpeg`, `image/png`, `image/webp`.
- Maximum size: 2 MB.
- Menu item must belong to the current tenant.
- User must satisfy `OwnerOrManager`.

Delete behavior:

- Delete the object from MinIO if it exists.
- Clear `ImageObjectKey` on the menu item.
- Return the updated `MenuItemResponse`.

Replace behavior:

- Upload the new object.
- Update `ImageObjectKey`.
- Best effort delete the old object after the database update succeeds.

## Storage Architecture

Add a storage abstraction:

```csharp
public interface IObjectStorageService
{
    Task PutAsync(string objectKey, Stream content, string contentType, CancellationToken cancellationToken);
    Task DeleteAsync(string objectKey, CancellationToken cancellationToken);
    Task<string> GetPresignedReadUrlAsync(string objectKey, TimeSpan ttl, CancellationToken cancellationToken);
}
```

Add `MinioObjectStorageService` as the first implementation. Menu services depend on the abstraction, not the MinIO SDK.

Configuration:

```text
Storage__Endpoint
Storage__AccessKey
Storage__SecretKey
Storage__BucketName
Storage__UseSsl
Storage__PresignedUrlTtlMinutes
```

Development defaults belong in `appsettings.Development.json` or `.env.example`; actual secrets must not be committed.

## Docker Compose

Add a `minio` service:

- Image: `minio/minio`
- API port: `9000`
- Console port: `9001`
- Volume: `restaurant_minio_data`
- Command: `server /data --console-address ":9001"`

Add a bucket setup path using either:

- A documented one-time command with `mc`, or
- A `minio-init` service that waits for MinIO and creates the bucket.

For MVP, a `minio-init` service is preferred because `docker compose up -d` should prepare the local storage dependency automatically.

## Frontend Design

Types:

- Add `imageUrl?: string` to `MenuItem`.

Menu management:

- Show current image preview when present.
- Add upload control for create/edit workflows.
- Allow replacing an image.
- Allow deleting an image.
- Show validation errors returned by the API.

Waiter menu view:

- Display image thumbnail when `imageUrl` exists.
- Use a stable fallback visual when the item has no image.
- Keep item cards fixed enough that images loading do not shift layout.

## Error Handling

- Invalid file type returns `400`.
- File too large returns `400`.
- Missing menu item returns `404`.
- Unauthorized roles return `403`.
- Storage upload failures return a controlled problem response and do not update `ImageObjectKey`.
- If old object deletion fails after replacement, log the error but keep the new image because the user-facing update already succeeded.

## Verification

Automated checks:

- API build passes.
- Web build passes.
- Web lint passes.

Manual checks:

- `docker compose up -d` starts PostgreSQL and MinIO.
- MinIO bucket exists after startup.
- Owner or manager can upload a menu item image.
- Waiter menu view displays the image after reload.
- Replacing an image updates the displayed image.
- Deleting an image clears the display and shows fallback UI.
- Invalid type and oversized file are rejected.

## Out of Scope

- Image resizing or WebP conversion.
- CDN support.
- Multi-image galleries.
- Direct browser upload to MinIO.
- Production object lifecycle policies.
