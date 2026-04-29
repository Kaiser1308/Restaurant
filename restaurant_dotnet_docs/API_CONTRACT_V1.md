# Restaurant API Contract V1

## 1. Purpose

This file defines the API contract for the Restaurant POS MVP.

Backend stack:

- ASP.NET Core Web API (.NET 9)
- Entity Framework Core
- PostgreSQL
- FluentValidation
- JWT Auth
- SignalR
- Serilog

Frontend stack:

- Vite React
- TypeScript
- TanStack Query
- React Router
- Zustand (optional, add when needed)
- `@microsoft/signalr` (deferred to Week 5)

Print agent:

- .NET Worker Service
- Polling print job endpoints
- ESC/POS TCP/LAN first
- Mock mode

Base API path:

```text
/api
```

SignalR hub path:

```text
/hubs/restaurant
```

## 2. API Conventions

### Authentication

Protected endpoints require:

```text
Authorization: Bearer <access_token>
```

### Tenant Context

`tenant_id` is derived from JWT claims.

Clients should not send `tenant_id` in normal business requests.

### Error Format

Use ASP.NET Core ProblemDetails style:

```json
{
  "type": "https://restaurant/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "Reason is required."
}
```

### Validation

All request DTOs must be validated with FluentValidation.

## 3. Auth API

## POST /api/auth/login

Login with username and password.

### Request

```json
{
  "username": "owner",
  "password": "password"
}
```

### Response 200

```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "uuid",
    "name": "Owner",
    "username": "owner",
    "role": "Owner"
  }
}
```

### Errors

- 400 validation error
- 401 invalid credentials
- 403 inactive user

## POST /api/auth/refresh

Refresh access token using a valid refresh token.

### Request

```json
{
  "refreshToken": "refresh-token"
}
```

### Response 200

```json
{
  "accessToken": "new-jwt-token",
  "refreshToken": "new-refresh-token"
}
```

### Errors

- 401 invalid or expired refresh token
- 401 revoked refresh token

### Rules

- Old refresh token is revoked after use (rotation).
- New refresh token is issued with each refresh.
- If refresh token is expired, user must login again.

## POST /api/auth/logout

Logout current user.

## GET /api/auth/me

Get current user.

### Response 200

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "name": "Owner",
  "username": "owner",
  "role": "Owner"
}
```

## 4. Tables API

## GET /api/tables

Get all restaurant tables.

### Response 200

```json
[
  {
    "id": "uuid",
    "name": "Table 1",
    "status": "Available"
  }
]
```

## POST /api/tables

Create table.

Allowed roles:

- Owner
- Manager

### Request

```json
{
  "name": "Table 1"
}
```

## PATCH /api/tables/{id}

Update table name or status.

Allowed roles:

- Owner
- Manager

### Request

```json
{
  "name": "Table 1A",
  "status": "Available"
}
```

## 5. Categories API

## GET /api/categories

Get all active categories.

## POST /api/categories

Create category.

Allowed roles:

- Owner
- Manager

### Request

```json
{
  "name": "Drinks",
  "sortOrder": 1
}
```

## PATCH /api/categories/{id}

Update category.

Allowed roles:

- Owner
- Manager

## 6. Menu Items API

## GET /api/menu-items

Get menu items.

### Query Parameters

- `categoryId`
- `available`
- `active`
- `search` (optional, searches by item name, case-insensitive, partial match)

### Response 200

```json
[
  {
    "id": "uuid",
    "categoryId": "uuid",
    "name": "Beef Noodle",
    "price": 50000,
    "description": "string",
    "isAvailable": true,
    "isActive": true
  }
]
```

## POST /api/menu-items

Create menu item.

Allowed roles:

- Owner
- Manager

### Request

```json
{
  "categoryId": "uuid",
  "name": "Beef Noodle",
  "price": 50000,
  "description": "Optional",
  "isAvailable": true
}
```

## PATCH /api/menu-items/{id}

Update menu item.

Allowed roles:

- Owner
- Manager

## PATCH /api/menu-items/{id}/availability

Toggle availability.

Allowed roles:

- Owner
- Manager

### Request

```json
{
  "isAvailable": false
}
```

## 7. Orders API

## POST /api/orders

Create an order for a table.

Allowed roles:

- Owner
- Manager
- Waiter
- Cashier

### Request

```json
{
  "tableId": "uuid"
}
```

### Response 201

```json
{
  "id": "uuid",
  "tableId": "uuid",
  "status": "Pending",
  "createdAt": "2026-04-29T10:00:00+07:00"
}
```

### Errors

- 409 if table already has active order

## GET /api/orders/{id}

Get order details.

### Response 200

```json
{
  "id": "uuid",
  "tableId": "uuid",
  "tableName": "Table 1",
  "status": "Pending",
  "items": [
    {
      "id": "uuid",
      "menuItemId": "uuid",
      "itemNameSnapshot": "Beef Noodle",
      "quantity": 2,
      "unitPrice": 50000,
      "lineTotal": 100000,
      "status": "Pending",
      "cancelReason": null
    }
  ],
  "totalAmount": 100000,
  "createdAt": "2026-04-29T10:00:00+07:00"
}
```

## GET /api/tables/{tableId}/active-order

Get active order for a table.

## POST /api/orders/{id}/items

Add item to pending order.

Allowed roles:

- Owner
- Manager
- Waiter

### Request

```json
{
  "menuItemId": "uuid",
  "quantity": 1
}
```

### Rules

- Order must be Pending or SentToKitchen.
- If order is SentToKitchen, new items are added as `pending`. Previously sent items remain locked.
- Menu item must be available.
- Unit price and item name must be snapshotted.

## PATCH /api/order-items/{itemId}

Update pending order item quantity.

Allowed roles:

- Owner
- Manager
- Waiter

### Request

```json
{
  "quantity": 3
}
```

### Errors

- 409 item already sent to kitchen
- 409 item already cancelled

## POST /api/order-items/{itemId}/cancel

Cancel pending order item.

Allowed roles:

- Owner
- Manager
- Waiter

### Request

```json
{
  "reason": "Customer changed order"
}
```

### Rules

- Reason required.
- Pending item can be cancelled.
- Cancel creates audit log.
- Cancel does not hard delete item.

## POST /api/orders/{id}/send-to-kitchen

Send order to kitchen.

Allowed roles:

- Owner
- Manager
- Waiter

### Response 200

```json
{
  "id": "uuid",
  "status": "SentToKitchen",
  "printJobId": "uuid"
}
```

### Rules

Must run in one transaction:

1. Validate order has pending items.
2. Set order status to SentToKitchen (if not already).
3. Set only `pending` items to SentToKitchen (do not touch already sent items).
4. Create kitchen print job containing only the newly sent items.
5. Create audit log.
6. Broadcast SignalR event.

## 8. Bills API

## POST /api/orders/{id}/pay

Pay order and create bill.

Allowed roles:

- Owner
- Manager
- Cashier

### Request

```json
{
  "paymentType": "Cash"
}
```

Allowed values:

- Cash
- Qr

### Response 201

```json
{
  "billId": "uuid",
  "billNumber": "BILL-000001",
  "orderId": "uuid",
  "status": "Paid",
  "paymentType": "Cash",
  "totalAmount": 150000,
  "paidAt": "2026-04-29T10:20:00+07:00",
  "printJobId": "uuid"
}
```

### Rules

Must run in one transaction:

1. Validate order.
2. Create bill.
3. Create bill item snapshots.
4. Mark order paid.
5. Create cashier print job.
6. Create audit log.
7. Broadcast SignalR event.

## GET /api/bills/{id}

Get bill details.

### Response 200

```json
{
  "id": "uuid",
  "billNumber": "BILL-000001",
  "orderId": "uuid",
  "status": "Paid",
  "paymentType": "Cash",
  "totalAmount": 150000,
  "items": [
    {
      "id": "uuid",
      "itemNameSnapshot": "Beef Noodle",
      "unitPriceSnapshot": 50000,
      "quantity": 3,
      "lineTotal": 150000
    }
  ],
  "paidAt": "2026-04-29T10:20:00+07:00"
}
```

## POST /api/bills/{id}/void

Void paid bill.

Allowed roles:

- Owner by default
- Future configurable permission

### Request

```json
{
  "reason": "Wrong payment"
}
```

### Rules

Must run in one transaction:

1. Validate bill status.
2. Validate permission.
3. Require reason.
4. Set bill status to Voided.
5. Create void log.
6. Create audit log.
7. Broadcast SignalR event.

## 9. Print Jobs API

## GET /api/print-jobs/pending

Used by .NET Worker Print Agent.

Authentication:

- Phase 1 can use JWT service account or API key.
- Recommended header:

```text
X-Print-Agent-Key: <key>
```

### Query Parameters

- `printerType`: Kitchen, Cashier, KitchenCancel
- `limit`: default 10

## POST /api/print-jobs/{id}/mark-printing

Mark job as printing.

## POST /api/print-jobs/{id}/mark-printed

Mark job as printed.

## POST /api/print-jobs/{id}/mark-failed

Mark job as failed.

### Request

```json
{
  "errorMessage": "Printer offline"
}
```

## 10. Audit Logs API

## GET /api/audit-logs

Get audit logs.

Allowed roles:

- Owner
- Manager if allowed

### Query Parameters

- `from`
- `to`
- `action`
- `entityType`
- `userId`
- `page`
- `pageSize`

## 11. Reports API

## GET /api/reports/daily-revenue

Get simple daily revenue.

Allowed roles:

- Owner
- Manager if allowed

### Query Parameters

- `date`: YYYY-MM-DD

### Response 200

```json
{
  "date": "2026-04-29",
  "paidBillCount": 20,
  "voidedBillCount": 2,
  "totalRevenue": 2500000,
  "voidedAmount": 150000
}
```

## 12. SignalR Hub

Path:

```text
/hubs/restaurant
```

Frontend package:

```bash
npm install @microsoft/signalr
```

Backend adds connection to group:

```text
tenant:{tenantId}
```

## Server-to-Client Events

### OrderUpdated

```json
{
  "orderId": "uuid",
  "tableId": "uuid",
  "status": "SentToKitchen"
}
```

### TableUpdated

```json
{
  "tableId": "uuid",
  "status": "Occupied"
}
```

### BillPaid

```json
{
  "billId": "uuid",
  "orderId": "uuid",
  "tableId": "uuid",
  "totalAmount": 150000
}
```

### BillVoided

```json
{
  "billId": "uuid",
  "reason": "Wrong payment"
}
```

### PrintJobUpdated

```json
{
  "printJobId": "uuid",
  "status": "Printed",
  "printerType": "Kitchen"
}
```

### AuditLogCreated

```json
{
  "auditLogId": "uuid",
  "action": "VoidBill",
  "entityType": "Bill"
}
```

## 13. Frontend Polling Strategy (Primary)

TanStack Query polling is the primary realtime strategy for Phase 1. SignalR is optional and deferred to Week 5.

Polling intervals:

- tables: `refetchInterval: 3000` (3 seconds)
- active orders / kitchen display: `refetchInterval: 2000` (2 seconds)
- print job status: `refetchInterval: 2000` during active print, then stop
- audit logs / reports: manual refresh only, no polling

## 14. Required API Controllers

- AuthController
- TablesController
- CategoriesController
- MenuItemsController
- OrdersController
- OrderItemsController
- BillsController
- PrintJobsController
- AuditLogsController
- ReportsController
