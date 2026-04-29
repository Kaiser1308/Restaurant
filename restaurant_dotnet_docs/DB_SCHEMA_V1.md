# Restaurant DB Schema V1

## 1. Purpose

This document defines the MVP database schema for Restaurant POS.

Implementation stack:

- ASP.NET Core Web API (.NET 9)
- Entity Framework Core
- PostgreSQL
- EF Core Migrations
- Npgsql provider

This file defines the logical schema. Actual implementation should be done through C# entities, `RestaurantDbContext`, and EF Core Fluent API configuration.

## 2. Core Principles

### Required Tenant Foundation

Every business table must have:

```text
TenantId Guid NOT NULL
```

Phase 1 has one default tenant, but tenant structure must exist from the first migration.

### No Hard Delete for Financial Records

Never hard delete:

- Orders
- OrderItems
- Bills
- BillItems
- VoidLogs
- PrintJobs
- AuditLogs

Use status changes instead.

### Snapshot Financial Data

Bills must use `BillItems` snapshots.

A bill must not depend on current `MenuItem.Price`.

### Audit Everything Sensitive

Sensitive actions create `AuditLog` entries.

### Print Through Jobs

Printing must go through `PrintJobs`.

The API never directly prints.

## 3. Naming Convention

C# classes use PascalCase:

- Tenant
- User
- RestaurantTable
- Category
- MenuItem
- Order
- OrderItem
- Bill
- BillItem
- VoidLog
- PrintJob
- AuditLog

Database table names should use snake_case if configured:

- tenants
- users
- restaurant_tables
- categories
- menu_items
- orders
- order_items
- bills
- bill_items
- void_logs
- print_jobs
- audit_logs

## 4. Recommended EF Core Packages

Install:

```bash
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```

Optional:

```bash
dotnet add package EFCore.NamingConventions
```

## 5. Enums

Use C# enums and store them as strings in PostgreSQL.

### UserRole

```csharp
public enum UserRole
{
    Owner,
    Manager,
    Cashier,
    Waiter
}
```

### TenantStatus

```csharp
public enum TenantStatus
{
    Active,
    Suspended
}
```

### TableStatus

```csharp
public enum TableStatus
{
    Available,
    Occupied,
    NeedsPayment,
    Closed
}
```

### OrderStatus

```csharp
public enum OrderStatus
{
    Pending,
    SentToKitchen,
    Paid,
    Cancelled,
    Voided
}
```

Note: `Cancelled` is used when all items in an order are cancelled and no bill was created.
```

### OrderItemStatus

```csharp
public enum OrderItemStatus
{
    Pending,
    SentToKitchen,
    Cancelled,
    Cooking,
    Ready,
    Served
}
```

Phase 1 logic only needs Pending, SentToKitchen, and Cancelled.

### BillStatus

```csharp
public enum BillStatus
{
    Paid,
    Voided
}
```

### PaymentType

```csharp
public enum PaymentType
{
    Cash,
    Qr
}
```

### PrinterType

```csharp
public enum PrinterType
{
    Kitchen,
    Cashier,
    KitchenCancel
}
```

### PrintJobStatus

```csharp
public enum PrintJobStatus
{
    Pending,
    Printing,
    Printed,
    Failed
}
```

## 6. Required Tables

## Tenant

Represents one restaurant/business.

Fields:

- `Id` Guid, PK
- `Name` string, required, max 200
- `Status` TenantStatus, required, default Active
- `CreatedAt` DateTimeOffset
- `UpdatedAt` DateTimeOffset

Indexes:

- `Status`

## User

Represents a staff account.

Fields:

- `Id` Guid, PK
- `TenantId` Guid, FK, required
- `Name` string, required, max 200
- `Username` string, required, max 100
- `PasswordHash` string, required
- `Role` UserRole, required
- `IsActive` bool, default true
- `CreatedAt` DateTimeOffset
- `UpdatedAt` DateTimeOffset

Constraints:

- Unique `(TenantId, Username)`

Indexes:

- `TenantId`
- `(TenantId, Username)`
- `(TenantId, Role)`

## RestaurantTable

Represents a physical restaurant table.

Fields:

- `Id` Guid, PK
- `TenantId` Guid, FK, required
- `Name` string, required, max 100
- `Status` TableStatus, required, default Available
- `CreatedAt` DateTimeOffset
- `UpdatedAt` DateTimeOffset

Constraints:

- Unique `(TenantId, Name)`

Indexes:

- `(TenantId, Status)`

## Category

Represents a menu category.

Fields:

- `Id` Guid, PK
- `TenantId` Guid, FK, required
- `Name` string, required, max 150
- `SortOrder` int, default 0
- `IsActive` bool, default true
- `CreatedAt` DateTimeOffset
- `UpdatedAt` DateTimeOffset

Constraints:

- Unique `(TenantId, Name)`

Indexes:

- `(TenantId, IsActive)`

## MenuItem

Represents a sellable menu item.

Fields:

- `Id` Guid, PK
- `TenantId` Guid, FK, required
- `CategoryId` Guid, FK, required
- `Name` string, required, max 200
- `Price` decimal(18,2), required
- `Description` string?, optional, max 1000
- `IsAvailable` bool, default true
- `IsActive` bool, default true
- `CreatedAt` DateTimeOffset
- `UpdatedAt` DateTimeOffset

Indexes:

- `(TenantId, CategoryId)`
- `(TenantId, IsAvailable)`
- `(TenantId, IsActive)`

Rules:

- Unavailable item cannot be added to order.
- Menu price changes must not affect old bill data.

## Order

Represents a table order.

Fields:

- `Id` Guid, PK
- `TenantId` Guid, FK, required
- `TableId` Guid, FK to RestaurantTable, required
- `CreatedByUserId` Guid, FK to User, required
- `Status` OrderStatus, required, default Pending
- `SentToKitchenAt` DateTimeOffset?, optional
- `PaidAt` DateTimeOffset?, optional
- `CreatedAt` DateTimeOffset
- `UpdatedAt` DateTimeOffset

Indexes:

- `(TenantId, TableId, Status)`
- `(TenantId, CreatedAt)`
- `(TenantId, Status)`

Rules:

- One table should not have more than one active unpaid order.
- After SentToKitchen, waiter cannot edit sent items.
- Order cannot be hard deleted.

## OrderItem

Represents one menu item line inside an order.

Fields:

- `Id` Guid, PK
- `TenantId` Guid, FK, required
- `OrderId` Guid, FK to Order, required
- `MenuItemId` Guid, FK to MenuItem, required
- `ItemNameSnapshot` string, required, max 200
- `Quantity` int, required
- `UnitPrice` decimal(18,2), required
- `Status` OrderItemStatus, required, default Pending
- `CancelReason` string?, optional, max 1000
- `CancelledByUserId` Guid?, FK to User
- `CancelledAt` DateTimeOffset?
- `SentToKitchenAt` DateTimeOffset?
- `CreatedAt` DateTimeOffset
- `UpdatedAt` DateTimeOffset

Indexes:

- `(TenantId, OrderId)`
- `(TenantId, Status)`
- `(TenantId, CreatedAt)`

Rules:

- Pending item can be updated.
- Pending item can be cancelled with reason.
- Sent item cannot be updated by waiter.
- Cancelled item remains visible.
- Quantity must be greater than 0.

## Bill

Represents payment result for an order.

Fields:

- `Id` Guid, PK
- `TenantId` Guid, FK, required
- `OrderId` Guid, FK to Order, required
- `BillNumber` string, required, max 50
- `Status` BillStatus, required, default Paid
- `PaymentType` PaymentType, required
- `TotalAmount` decimal(18,2), required
- `PaidByUserId` Guid, FK to User, required
- `PaidAt` DateTimeOffset, required
- `VoidedAt` DateTimeOffset?
- `VoidedByUserId` Guid?, FK to User
- `CreatedAt` DateTimeOffset
- `UpdatedAt` DateTimeOffset

Constraints:

- Unique `(TenantId, BillNumber)`
- Unique `(TenantId, OrderId)` for one bill per order in Phase 1

BillNumber generation:

- Format: `{YYYYMMDD}-{SEQ:4}` (example: `20260429-0001`).
- Sequence is per tenant per day, resets daily.
- Use the `BillNumberSequence` helper table (see below) with row-level locking to ensure concurrency safety.
- Implementation: `SELECT ... FOR UPDATE` on the sequence row, increment, format, and use within the same transaction as bill creation.

Indexes:

- `(TenantId, PaidAt)`
- `(TenantId, Status)`
- `(TenantId, PaymentType)`

Rules:

- Bill cannot be hard deleted.
- Paid bill cannot be edited directly.
- Bill can be voided with reason and permission.
- TotalAmount must equal sum of BillItems.

## BillItem

Snapshot of order item at payment time.

Fields:

- `Id` Guid, PK
- `TenantId` Guid, FK, required
- `BillId` Guid, FK to Bill, required
- `OrderItemId` Guid?, FK to OrderItem, optional
- `ItemNameSnapshot` string, required, max 200
- `UnitPriceSnapshot` decimal(18,2), required
- `Quantity` int, required
- `LineTotal` decimal(18,2), required
- `CreatedAt` DateTimeOffset

Indexes:

- `(TenantId, BillId)`

Rules:

- Created only when bill is paid.
- Should not be modified after creation.
- Preserves historical bill data.

## VoidLog

Tracks bill voiding.

Fields:

- `Id` Guid, PK
- `TenantId` Guid, FK, required
- `BillId` Guid, FK to Bill, required
- `UserId` Guid, FK to User, required
- `Reason` string, required, max 1000
- `CreatedAt` DateTimeOffset

Indexes:

- `(TenantId, BillId)`
- `(TenantId, CreatedAt)`
- `(TenantId, UserId)`

Rules:

- Created when bill is voided.
- Must also create AuditLog.
- Must not be deleted.

## PrintJob

Tracks every print attempt.

Fields:

- `Id` Guid, PK
- `TenantId` Guid, FK, required
- `EntityType` string, required, max 50
- `EntityId` Guid, required
- `PrinterType` PrinterType, required
- `PrintKey` string, required, max 200
- `Status` PrintJobStatus, required, default Pending
- `ContentJson` string or jsonb, required
- `ErrorMessage` string?, optional, max 2000
- `RetryCount` int, default 0
- `PrintedAt` DateTimeOffset?
- `CreatedAt` DateTimeOffset
- `UpdatedAt` DateTimeOffset

Constraints:

- Unique `(TenantId, PrintKey)`

Indexes:

- `(TenantId, Status)`
- `(TenantId, PrinterType, Status)`
- `(TenantId, CreatedAt)`

Rules:

- PrintKey prevents duplicate printing.
- Agent updates status.
- Failed jobs remain visible.

## AuditLog

Tracks sensitive actions.

Fields:

- `Id` Guid, PK
- `TenantId` Guid, FK, required
- `UserId` Guid?, FK to User, optional for system actions
- `Action` string, required, max 100
- `EntityType` string, required, max 100
- `EntityId` Guid, required
- `OldValueJson` string or jsonb?, optional
- `NewValueJson` string or jsonb?, optional
- `Reason` string?, optional, max 1000
- `CreatedAt` DateTimeOffset

Indexes:

- `(TenantId, CreatedAt)`
- `(TenantId, UserId)`
- `(TenantId, Action)`
- `(TenantId, EntityType, EntityId)`

Rules:

- Never edit audit records.
- Never delete audit records.
- Every sensitive business action must write audit log.

## 7. BillNumberSequence Table

Helper table for concurrency-safe bill number generation.

Fields:

- `Id` Guid, PK
- `TenantId` Guid, FK, required
- `Date` DateOnly, required
- `LastSequence` int, default 0

Constraints:

- Unique `(TenantId, Date)`

Usage:

When creating a bill:

1. Query `BillNumberSequence` for current tenant + today with `FOR UPDATE` lock.
2. If no row exists, insert with `LastSequence = 1`.
3. If row exists, increment `LastSequence`.
4. Format: `{Date:yyyyMMdd}-{LastSequence:D4}`.
5. This must happen inside the pay order transaction.

## 8. RefreshToken Table

Required for MVP to support token refresh without forcing re-login.

Fields:

- `Id` Guid, PK
- `TenantId` Guid, FK, required
- `UserId` Guid, FK, required
- `TokenHash` string, required
- `ExpiresAt` DateTimeOffset, required
- `RevokedAt` DateTimeOffset?
- `CreatedAt` DateTimeOffset

Constraints:

- Index `(UserId, ExpiresAt)`

Rules:

- Store hashed refresh token, not plaintext.
- On refresh, validate hash and expiry.
- On logout, revoke all active tokens for user.
- Expired tokens can be cleaned up periodically.

## 9. Optional Tables

### PrinterConfig

For MVP, printer config can live inside print-agent `appsettings.json`.

If DB-managed printer config is needed:

- `Id` Guid
- `TenantId` Guid
- `Name` string
- `PrinterType` PrinterType
- `ConnectionType` string
- `IpAddress` string?
- `Port` int?
- `PaperWidth` int?
- `IsActive` bool
- `CreatedAt`
- `UpdatedAt`

## 10. EF Core Configuration Rules

### Decimal Precision

Configure monetary fields:

```csharp
builder.Property(x => x.Price).HasPrecision(18, 2);
builder.Property(x => x.TotalAmount).HasPrecision(18, 2);
builder.Property(x => x.LineTotal).HasPrecision(18, 2);
```

### Enum Storage

Use string conversion:

```csharp
builder.Property(x => x.Status).HasConversion<string>();
```

### Delete Behavior

Avoid cascade delete for financial data.

Use:

```csharp
.OnDelete(DeleteBehavior.Restrict)
```

where appropriate.

## 11. Required First Migration

Migration name:

```bash
dotnet ef migrations add InitialCreate
```

It should create all MVP tables including `BillNumberSequence` and `RefreshToken`.

## 12. Seed Data

Required seed:

- Default tenant.
- Default owner account.
- Optional sample tables.
- Optional sample categories/menu items.

Default tenant:

```text
Name: Default Restaurant
Status: Active
```

Default owner:

```text
Username: owner
Role: Owner
Password: set in development secret or documented local default
```

Do not store plaintext password in production.

## 13. Critical Transaction Boundaries

### SendToKitchen

1. Load order and items.
2. Validate status.
3. Set order status.
4. Set pending items to SentToKitchen.
5. Create kitchen PrintJob.
6. Create AuditLog.
7. Commit.

### PayOrder

1. Load order and non-cancelled items.
2. Validate payable state.
3. Create Bill.
4. Create BillItems snapshots.
5. Set order status to Paid.
6. Create cashier PrintJob.
7. Create AuditLog.
8. Commit.

### VoidBill

1. Load bill.
2. Validate permission.
3. Validate bill status is Paid.
4. Set status to Voided.
5. Create VoidLog.
6. Create AuditLog.
7. Commit.

### CancelOrderItem

1. Load item.
2. Validate item status.
3. Require reason.
4. Set status to Cancelled.
5. Store reason/user/time.
6. Create AuditLog.
7. Commit.
