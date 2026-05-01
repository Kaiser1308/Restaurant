# Menu Item Images with MinIO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add menu item image upload, storage, display, replacement, and deletion using a private MinIO bucket.

**Architecture:** The API owns all image operations. `MenuItem` stores a nullable `ImageObjectKey`, while responses return a short-lived `imageUrl` generated through a storage abstraction. MinIO is added as a local Docker dependency and hidden behind `IObjectStorageService`.

**Tech Stack:** ASP.NET Core .NET 9, EF Core, PostgreSQL, MinIO S3-compatible storage, Vite React, TypeScript, TanStack Query.

---

## Current Context

Relevant existing files:

- `docker-compose.yml`: currently only defines PostgreSQL.
- `apps/api/Restaurant.Api/Restaurant.Api.csproj`: API packages live here.
- `apps/api/Restaurant.Api/Domain/Entities/MenuItem.cs`: menu item entity.
- `apps/api/Restaurant.Api/DTOs/MenuItems/*.cs`: menu item request/response DTOs.
- `apps/api/Restaurant.Api/Services/MenuItemService.cs`: create/update/query behavior and response mapping.
- `apps/api/Restaurant.Api/Services/IMenuItemService.cs`: menu service contract.
- `apps/api/Restaurant.Api/Repositories/MenuItemRepository.cs`: menu item data access.
- `apps/api/Restaurant.Api/Infrastructure/Persistence/RestaurantDbContext.cs`: EF model config.
- `apps/api/Restaurant.Api/Controllers/MenuItemsController.cs`: menu item routes.
- `apps/api/Restaurant.Api/Program.cs`: dependency injection setup.
- `apps/web/src/features/menu/api/menuApi.ts`: frontend menu API calls.
- `apps/web/src/types/pos.ts`: shared frontend POS types.

Before editing any symbol, run GitNexus impact analysis as required by `AGENTS.md`. For this plan, the minimum targets are:

```bash
gitnexus_impact({target: "MenuItem", direction: "upstream"})
gitnexus_impact({target: "MenuItemService", direction: "upstream"})
gitnexus_impact({target: "MenuItemsController", direction: "upstream"})
```

---

### Task 1: Add MinIO to Local Infrastructure

**Files:**
- Modify: `docker-compose.yml`
- Modify: `.env.example`

- [ ] **Step 1: Update Docker Compose with MinIO**

Add `minio` and `minio-init` services, plus a `restaurant_minio_data` volume:

```yaml
  minio:
    image: minio/minio:latest
    container_name: restaurant_minio
    restart: unless-stopped
    environment:
      MINIO_ROOT_USER: restaurant_minio
      MINIO_ROOT_PASSWORD: restaurant_minio_password
    command: ["server", "/data", "--console-address", ":9001"]
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - restaurant_minio_data:/data

  minio-init:
    image: minio/mc:latest
    container_name: restaurant_minio_init
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      until mc alias set local http://minio:9000 restaurant_minio restaurant_minio_password; do sleep 2; done;
      mc mb --ignore-existing local/restaurant-images;
      mc anonymous set none local/restaurant-images;
      "
```

Add this to `volumes`:

```yaml
  restaurant_minio_data:
```

- [ ] **Step 2: Add environment template values**

Add these keys to `.env.example`:

```text
Storage__Endpoint=http://localhost:9000
Storage__AccessKey=restaurant_minio
Storage__SecretKey=restaurant_minio_password
Storage__BucketName=restaurant-images
Storage__UseSsl=false
Storage__PresignedUrlTtlMinutes=60
```

- [ ] **Step 3: Verify infrastructure starts**

Run:

```bash
docker compose up -d
docker ps
```

Expected:

```text
restaurant_postgres
restaurant_minio
```

- [ ] **Step 4: Commit infrastructure changes**

```bash
git add docker-compose.yml .env.example
git commit -m "chore: add minio storage service"
```

---

### Task 2: Add API Storage Configuration and MinIO SDK

**Files:**
- Modify: `apps/api/Restaurant.Api/Restaurant.Api.csproj`
- Create: `apps/api/Restaurant.Api/Infrastructure/Storage/StorageOptions.cs`
- Create: `apps/api/Restaurant.Api/Infrastructure/Storage/IObjectStorageService.cs`
- Create: `apps/api/Restaurant.Api/Infrastructure/Storage/MinioObjectStorageService.cs`
- Modify: `apps/api/Restaurant.Api/appsettings.Development.json`
- Modify: `apps/api/Restaurant.Api/Program.cs`

- [ ] **Step 1: Add MinIO package**

Run:

```bash
cmd.exe /c "dotnet add apps\api\Restaurant.Api\Restaurant.Api.csproj package Minio"
```

Expected: `Restaurant.Api.csproj` contains a `PackageReference` for `Minio`.

- [ ] **Step 2: Create storage options**

Create `apps/api/Restaurant.Api/Infrastructure/Storage/StorageOptions.cs`:

```csharp
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
```

- [ ] **Step 3: Create storage abstraction**

Create `apps/api/Restaurant.Api/Infrastructure/Storage/IObjectStorageService.cs`:

```csharp
namespace Restaurant.Api.Infrastructure.Storage;

public interface IObjectStorageService
{
    Task PutAsync(string objectKey, Stream content, string contentType, CancellationToken cancellationToken = default);
    Task DeleteAsync(string objectKey, CancellationToken cancellationToken = default);
    Task<string> GetPresignedReadUrlAsync(string objectKey, TimeSpan ttl, CancellationToken cancellationToken = default);
}
```

- [ ] **Step 4: Create MinIO implementation**

Create `apps/api/Restaurant.Api/Infrastructure/Storage/MinioObjectStorageService.cs`:

```csharp
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
```

- [ ] **Step 5: Add development config**

Add this section to `apps/api/Restaurant.Api/appsettings.Development.json`:

```json
"Storage": {
  "Endpoint": "localhost:9000",
  "AccessKey": "restaurant_minio",
  "SecretKey": "restaurant_minio_password",
  "BucketName": "restaurant-images",
  "UseSsl": false,
  "PresignedUrlTtlMinutes": 60
}
```

- [ ] **Step 6: Register storage services**

In `apps/api/Restaurant.Api/Program.cs`, add:

```csharp
using Minio;
using Restaurant.Api.Infrastructure.Storage;
```

Register after configuration setup:

```csharp
builder.Services.Configure<StorageOptions>(builder.Configuration.GetSection("Storage"));
builder.Services.AddSingleton<IMinioClient>(serviceProvider =>
{
    var options = serviceProvider.GetRequiredService<IOptions<StorageOptions>>().Value;
    var client = new MinioClient()
        .WithEndpoint(options.Endpoint)
        .WithCredentials(options.AccessKey, options.SecretKey);

    if (options.UseSsl)
    {
        client = client.WithSSL();
    }

    return client.Build();
});
builder.Services.AddSingleton<IObjectStorageService, MinioObjectStorageService>();
```

If `IOptions<T>` is not already in scope, add:

```csharp
using Microsoft.Extensions.Options;
```

- [ ] **Step 7: Verify API compiles**

Run:

```bash
cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"
```

Expected:

```text
Build succeeded.
```

- [ ] **Step 8: Commit storage setup**

```bash
git add apps/api/Restaurant.Api/Restaurant.Api.csproj apps/api/Restaurant.Api/Infrastructure/Storage apps/api/Restaurant.Api/appsettings.Development.json apps/api/Restaurant.Api/Program.cs
git commit -m "feat: add minio object storage service"
```

---

### Task 3: Add Menu Item Image Data Model

**Files:**
- Modify: `apps/api/Restaurant.Api/Domain/Entities/MenuItem.cs`
- Modify: `apps/api/Restaurant.Api/Infrastructure/Persistence/RestaurantDbContext.cs`
- Modify: `apps/api/Restaurant.Api/DTOs/MenuItems/MenuItemResponse.cs`
- Modify: `apps/api/Restaurant.Api/Services/MenuItemService.cs`
- Generated: `apps/api/Restaurant.Api/Infrastructure/Persistence/Migrations/*AddMenuItemImage*.cs`

- [ ] **Step 1: Add entity field**

Add to `MenuItem`:

```csharp
public string? ImageObjectKey { get; set; }
```

- [ ] **Step 2: Configure EF column**

Inside the `modelBuilder.Entity<MenuItem>` block:

```csharp
entity.Property(x => x.ImageObjectKey).HasMaxLength(500);
```

- [ ] **Step 3: Add response field**

Change `MenuItemResponse` to:

```csharp
namespace Restaurant.Api.DTOs.MenuItems;

public sealed record MenuItemResponse(
    Guid Id,
    Guid CategoryId,
    string Name,
    decimal Price,
    string? Description,
    bool IsAvailable,
    bool IsActive,
    string? ImageUrl);
```

- [ ] **Step 4: Temporarily map image URL as null**

In `MenuItemService.Map`, return:

```csharp
private static MenuItemResponse Map(MenuItem item)
    => new(item.Id, item.CategoryId, item.Name, item.Price, item.Description, item.IsAvailable, item.IsActive, null);
```

This keeps existing query/create/update behavior compiling before URL generation is added.

- [ ] **Step 5: Generate migration**

Run:

```bash
cmd.exe /c "dotnet ef migrations add AddMenuItemImage --project apps\api\Restaurant.Api"
```

Expected: migration adds nullable `image_object_key` to `menu_items`.

- [ ] **Step 6: Verify API compiles**

Run:

```bash
cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"
```

Expected:

```text
Build succeeded.
```

- [ ] **Step 7: Commit data model**

```bash
git add apps/api/Restaurant.Api/Domain/Entities/MenuItem.cs apps/api/Restaurant.Api/Infrastructure/Persistence/RestaurantDbContext.cs apps/api/Restaurant.Api/DTOs/MenuItems/MenuItemResponse.cs apps/api/Restaurant.Api/Services/MenuItemService.cs apps/api/Restaurant.Api/Infrastructure/Persistence/Migrations
git commit -m "feat: add menu item image metadata"
```

---

### Task 4: Add Menu Item Image Upload and Delete API

**Files:**
- Modify: `apps/api/Restaurant.Api/Services/IMenuItemService.cs`
- Modify: `apps/api/Restaurant.Api/Services/MenuItemService.cs`
- Modify: `apps/api/Restaurant.Api/Controllers/MenuItemsController.cs`

- [ ] **Step 1: Extend service contract**

Add methods to `IMenuItemService`:

```csharp
Task<MenuItemResponse> UploadImageAsync(Guid id, IFormFile image, CancellationToken cancellationToken = default);
Task<MenuItemResponse> DeleteImageAsync(Guid id, CancellationToken cancellationToken = default);
```

- [ ] **Step 2: Inject storage dependencies**

Update `MenuItemService` constructor:

```csharp
public sealed class MenuItemService(
    IMenuItemRepository menuItemRepository,
    ICategoryRepository categoryRepository,
    ITenantContext tenantContext,
    IObjectStorageService objectStorageService,
    IOptions<StorageOptions> storageOptions,
    ILogger<MenuItemService> logger) : IMenuItemService
```

Add usings:

```csharp
using Microsoft.Extensions.Options;
using Restaurant.Api.Infrastructure.Storage;
```

- [ ] **Step 3: Add image validation helpers**

Add to `MenuItemService`:

```csharp
private const long MaxImageBytes = 2 * 1024 * 1024;
private static readonly HashSet<string> AllowedImageContentTypes = new(StringComparer.OrdinalIgnoreCase)
{
    "image/jpeg",
    "image/png",
    "image/webp"
};

private static string GetFileExtension(string contentType)
    => contentType.ToLowerInvariant() switch
    {
        "image/jpeg" => ".jpg",
        "image/png" => ".png",
        "image/webp" => ".webp",
        _ => throw new ValidationException("Unsupported image type.")
    };

private static void ValidateImage(IFormFile image)
{
    if (image.Length == 0)
    {
        throw new ValidationException("Image file is required.");
    }

    if (image.Length > MaxImageBytes)
    {
        throw new ValidationException("Image file must be 2 MB or smaller.");
    }

    if (!AllowedImageContentTypes.Contains(image.ContentType))
    {
        throw new ValidationException("Image must be JPG, PNG, or WebP.");
    }
}
```

Add using:

```csharp
using FluentValidation;
```

- [ ] **Step 4: Implement upload**

Add to `MenuItemService`:

```csharp
public async Task<MenuItemResponse> UploadImageAsync(Guid id, IFormFile image, CancellationToken cancellationToken = default)
{
    ValidateImage(image);

    var item = await menuItemRepository.GetByIdAsync(id, cancellationToken)
        ?? throw new NotFoundException("Menu item not found.");

    var tenantId = tenantContext.TenantId ?? Guid.Empty;
    var oldObjectKey = item.ImageObjectKey;
    var extension = GetFileExtension(image.ContentType);
    var objectKey = $"tenants/{tenantId}/menu-items/{item.Id}/{Guid.NewGuid():N}{extension}";

    await using var stream = image.OpenReadStream();
    await objectStorageService.PutAsync(objectKey, stream, image.ContentType, cancellationToken);

    item.ImageObjectKey = objectKey;
    item.UpdatedAt = DateTimeOffset.UtcNow;
    await menuItemRepository.SaveChangesAsync(cancellationToken);

    if (!string.IsNullOrWhiteSpace(oldObjectKey))
    {
        try
        {
            await objectStorageService.DeleteAsync(oldObjectKey, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to delete old menu item image {ObjectKey}", oldObjectKey);
        }
    }

    return await MapAsync(item, cancellationToken);
}
```

- [ ] **Step 5: Implement delete**

Add to `MenuItemService`:

```csharp
public async Task<MenuItemResponse> DeleteImageAsync(Guid id, CancellationToken cancellationToken = default)
{
    var item = await menuItemRepository.GetByIdAsync(id, cancellationToken)
        ?? throw new NotFoundException("Menu item not found.");

    var oldObjectKey = item.ImageObjectKey;
    item.ImageObjectKey = null;
    item.UpdatedAt = DateTimeOffset.UtcNow;
    await menuItemRepository.SaveChangesAsync(cancellationToken);

    if (!string.IsNullOrWhiteSpace(oldObjectKey))
    {
        await objectStorageService.DeleteAsync(oldObjectKey, cancellationToken);
    }

    return await MapAsync(item, cancellationToken);
}
```

- [ ] **Step 6: Generate presigned URLs in mapping**

Replace `Map` with:

```csharp
private async Task<MenuItemResponse> MapAsync(MenuItem item, CancellationToken cancellationToken)
{
    string? imageUrl = null;
    if (!string.IsNullOrWhiteSpace(item.ImageObjectKey))
    {
        imageUrl = await objectStorageService.GetPresignedReadUrlAsync(
            item.ImageObjectKey,
            TimeSpan.FromMinutes(storageOptions.Value.PresignedUrlTtlMinutes),
            cancellationToken);
    }

    return new MenuItemResponse(
        item.Id,
        item.CategoryId,
        item.Name,
        item.Price,
        item.Description,
        item.IsAvailable,
        item.IsActive,
        imageUrl);
}
```

Update query mapping:

```csharp
var responses = new List<MenuItemResponse>();
foreach (var item in items)
{
    responses.Add(await MapAsync(item, cancellationToken));
}

return responses;
```

Update create/update/availability methods to return:

```csharp
return await MapAsync(item, cancellationToken);
```

- [ ] **Step 7: Add controller routes**

Add to `MenuItemsController`:

```csharp
[HttpPost("{id:guid}/image")]
[Authorize(Policy = "OwnerOrManager")]
[RequestSizeLimit(2 * 1024 * 1024)]
public async Task<ActionResult<MenuItemResponse>> UploadImage(Guid id, IFormFile image, CancellationToken cancellationToken)
{
    var result = await menuItemService.UploadImageAsync(id, image, cancellationToken);
    return Ok(result);
}

[HttpDelete("{id:guid}/image")]
[Authorize(Policy = "OwnerOrManager")]
public async Task<ActionResult<MenuItemResponse>> DeleteImage(Guid id, CancellationToken cancellationToken)
{
    var result = await menuItemService.DeleteImageAsync(id, cancellationToken);
    return Ok(result);
}
```

- [ ] **Step 8: Verify API compiles**

Run:

```bash
cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"
```

Expected:

```text
Build succeeded.
```

- [ ] **Step 9: Commit API image endpoints**

```bash
git add apps/api/Restaurant.Api/Services/IMenuItemService.cs apps/api/Restaurant.Api/Services/MenuItemService.cs apps/api/Restaurant.Api/Controllers/MenuItemsController.cs
git commit -m "feat: add menu item image upload endpoints"
```

---

### Task 5: Add Frontend Image API and Types

**Files:**
- Modify: `apps/web/src/types/pos.ts`
- Modify: `apps/web/src/features/menu/api/menuApi.ts`

- [ ] **Step 1: Add image URL type**

In `MenuItem`, add:

```typescript
imageUrl?: string
```

- [ ] **Step 2: Add upload and delete API calls**

Add to `menuApi`:

```typescript
async uploadMenuItemImage(id: string, image: File) {
  const formData = new FormData()
  formData.append('image', image)

  const response = await apiClient.post<MenuItem>(`/api/menu-items/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
},
async deleteMenuItemImage(id: string) {
  const response = await apiClient.delete<MenuItem>(`/api/menu-items/${id}/image`)
  return response.data
},
```

- [ ] **Step 3: Verify frontend compiles**

Run:

```bash
cmd.exe /c "cd apps\web && npm run build"
```

Expected:

```text
✓ built
```

- [ ] **Step 4: Commit frontend API**

```bash
git add apps/web/src/types/pos.ts apps/web/src/features/menu/api/menuApi.ts
git commit -m "feat: add menu item image client api"
```

---

### Task 6: Add Image UI to Menu Management and Waiter Menu View

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/i18n/locales/vi/menu.json`
- Modify: `apps/web/src/i18n/locales/en/menu.json`

- [ ] **Step 1: Confirm current render locations**

Run:

```bash
cmd.exe /c "findstr /n /i \"menuItems createMenuItem\" apps\web\src\App.tsx"
```

Expected:

```text
apps\web\src\App.tsx contains WaiterOrderPage menu item cards and OwnerDashboardPage menu item creation.
```

- [ ] **Step 2: Add stable image display**

In `WaiterOrderPage`, replace the menu item card body inside `{menuItems.map(item => (` with this pattern:

```tsx
<div key={item.id} className="grid grid-cols-[96px_1fr] gap-3 rounded border p-3">
  <div className="aspect-square overflow-hidden rounded-md bg-stone-100">
    {item.imageUrl ? (
      <img
        src={item.imageUrl}
        alt={item.name}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-xs text-stone-500">
        {t('menuItem.noImage', { ns: 'menu' })}
      </div>
    )}
  </div>
  <div className="space-y-2">
    <div>
      <p className="font-semibold">{item.name}</p>
      <p className="text-sm">{formatMoney(item.price)}</p>
    </div>
    <Button
      size="sm"
      disabled={!item.isAvailable || addItem.isPending}
      onClick={() => addItem.mutate(item.id)}
    >
      {t('actions.addItem')}
    </Button>
  </div>
</div>
```

- [ ] **Step 3: Add upload control to management form**

In `OwnerDashboardPage`, add state near `menuPrice`:

```tsx
const [selectedImage, setSelectedImage] = useState<File | null>(null)
const [menuFormError, setMenuFormError] = useState('')
```

Add handler near the mutations:

```tsx
function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
  setSelectedImage(event.target.files?.[0] ?? null)
  setMenuFormError('')
}
```

Update `createMenuItem` so upload runs after create:

```tsx
const createMenuItem = useMutation({
  mutationFn: async () => {
    const savedItem = await menuApi.createMenuItem({
      categoryId: categories[0]?.id || '',
      name: menuName.trim(),
      price: Number(menuPrice),
      isAvailable: true,
    })

    if (selectedImage) {
      await menuApi.uploadMenuItemImage(savedItem.id, selectedImage)
    }

    return savedItem
  },
  onSuccess: () => {
    setMenuName('')
    setMenuPrice('50000')
    setSelectedImage(null)
    setMenuFormError('')
    queryClient.invalidateQueries({ queryKey: ['menuItems'] })
  },
  onError: () => {
    setMenuFormError(t('menu:menuItem.imageUploadError'))
  },
})
```

Add the file input next to the menu name and price fields:

```tsx
<input
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onChange={handleImageChange}
  className="rounded-md border px-3 py-2 text-sm"
/>
```

Show `menuFormError` below the form:

```tsx
{menuFormError ? <p className="mt-2 text-sm text-red-600">{menuFormError}</p> : null}
```

- [ ] **Step 4: Add delete image action for listed menu items if owner view lists items**

If `OwnerDashboardPage` already lists menu items by the time this task is executed, render a delete image button for each item with `imageUrl`:

```tsx
<Button
  variant="secondary"
  size="sm"
  onClick={async () => {
    await menuApi.deleteMenuItemImage(item.id)
    queryClient.invalidateQueries({ queryKey: ['menuItems'] })
  }}
>
  {t('menu:menuItem.deleteImage')}
</Button>
```

If the owner view still only has a create form and does not list items, skip this button and keep delete support available through `menuApi.deleteMenuItemImage` for the later edit UI.

- [ ] **Step 5: Add translations**

Add to `apps/web/src/i18n/locales/vi/menu.json` under `menuItem`:

```json
"noImage": "Chưa có ảnh",
"imageUploadError": "Ảnh phải là JPG, PNG hoặc WebP và tối đa 2 MB.",
"deleteImage": "Xóa ảnh"
```

Add to `apps/web/src/i18n/locales/en/menu.json` under `menuItem`:

```json
"noImage": "No image",
"imageUploadError": "Image must be JPG, PNG, or WebP and 2 MB or smaller.",
"deleteImage": "Delete image"
```

- [ ] **Step 6: Verify frontend**

Run:

```bash
cmd.exe /c "cd apps\web && npm run lint"
cmd.exe /c "cd apps\web && npm run build"
```

Expected:

```text
eslint exits 0
✓ built
```

- [ ] **Step 7: Commit image UI**

```bash
git add apps/web/src/App.tsx apps/web/src/i18n/locales/vi/menu.json apps/web/src/i18n/locales/en/menu.json
git commit -m "feat: show and manage menu item images"
```

---

### Task 7: End-to-End Verification

**Files:**
- No planned source edits.

- [ ] **Step 1: Start dependencies**

Run:

```bash
docker compose up -d
docker ps
```

Expected:

```text
restaurant_postgres
restaurant_minio
```

- [ ] **Step 2: Start API**

Run:

```bash
cmd.exe /c "dotnet run --project apps\api\Restaurant.Api"
```

Expected:

```text
Now listening on: http://localhost:5141
```

- [ ] **Step 3: Start web**

In another terminal:

```bash
cmd.exe /c "cd apps\web && npm run dev"
```

Expected:

```text
Local: http://localhost:5173
```

- [ ] **Step 4: Manual browser check**

Verify:

- Owner or manager can upload a JPG, PNG, or WebP image for a menu item.
- Waiter menu view displays the image after page reload.
- Replacing the image updates the displayed image.
- Deleting the image returns the card to fallback UI.
- Uploading a text file is rejected.
- Uploading a file larger than 2 MB is rejected.

- [ ] **Step 5: Final technical checks**

Run:

```bash
cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"
cmd.exe /c "dotnet build apps\print-agent\Restaurant.PrintAgent\Restaurant.PrintAgent.csproj"
cmd.exe /c "cd apps\web && npm run lint"
cmd.exe /c "cd apps\web && npm run build"
```

Expected:

```text
Build succeeded.
eslint exits 0
✓ built
```

- [ ] **Step 6: Run GitNexus detect changes**

Run:

```bash
gitnexus_detect_changes({scope: "staged"})
```

Expected:

```text
risk_level is low or medium, with no unexplained affected flows
```

- [ ] **Step 7: Push branch**

Run:

```bash
git push
```

Expected: branch updates on remote.

---

## Plan Self-Review

Spec coverage:

- Private MinIO bucket: Task 1 and Task 2.
- `ImageObjectKey` data model: Task 3.
- Presigned `imageUrl` responses: Task 4.
- Upload/delete endpoints: Task 4.
- Frontend API/types: Task 5.
- Menu management and waiter display: Task 6.
- Build, lint, manual verification: Task 7.

Type consistency:

- Backend uses `ImageObjectKey`.
- API response uses `ImageUrl`.
- Frontend type uses `imageUrl`.
- Upload form field uses `image`.

Scope control:

- Image resizing, CDN, galleries, direct browser upload, and lifecycle policies remain out of scope.
