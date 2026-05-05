# Week 4 (Print Agent + Integration) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoan thanh Week 4 de core flow co print jobs va print agent mock mode chay end-to-end (khong can may in), kem UI hien thi trang thai in tren Order/Bill.

**Architecture:** Print jobs duoc tao tu API (OrderService, BillService) va duoc print agent poll qua `api/print-jobs/*` bang agent key. Frontend poll trang thai print job moi nhat theo business entity (`order` hoac `bill`), khong can realtime va khong phu thuoc state tam thoi tu mutation.

**Tech Stack:** .NET 9 (API + Worker Service), PostgreSQL, Vite React + TS + Tailwind v4, TanStack Query.

---

## Scope And Assumptions

- Scope chuan theo `restaurant_dotnet_docs/PHASE_1_TASKS.md` (Week 4: Day 22-28).
- Khong can may in de hoan thanh toi Day 24 va Day 26/27 (Mock mode).
- Day 25 (ESC/POS TCP/LAN) se implement "behind config" va chi verify bang smoke test (khong cam ket in that khi chua co may in).
- **Decision checkpoint (Day 26 backend):** Week 4 spec co dong "cancel after sent to kitchen tao kitchen_cancel print job". Hien tai API chi cho cancel khi `OrderItemStatus.Pending`. Neu can ho tro cancel sau khi da sent, se phai thay doi business rule. Thuc hien thay doi nay chi neu ban xac nhan.

---

## Current State (As Of 2026-05-04)

Da co san trong repo:

- API:
  - `apps/api/Restaurant.Api/Controllers/PrintJobsController.cs` (pending + mark printing/printed/failed + agent key guard)
  - `apps/api/Restaurant.Api/Services/PrintJobService.cs` + `Repositories/IPrintJobRepository.cs` + `Repositories/PrintJobRepository.cs`
  - `apps/api/Restaurant.Api/Services/OrderService.cs` tao kitchen PrintJob trong `SendToKitchenAsync`
  - `apps/api/Restaurant.Api/Services/BillService.cs` tao cashier PrintJob trong `PayOrderAsync`
- Print Agent:
  - `apps/print-agent/Restaurant.PrintAgent/Worker.cs` poll pending -> mark printing -> log -> mark printed (mark failed on exception)
  - `apps/print-agent/Restaurant.PrintAgent/PrintJobClient.cs`
  - `apps/print-agent/Restaurant.PrintAgent/TicketFormatter.cs` (format ticket tu `ContentJson`)

Ke hoach Week 4 se tap trung vao:

- Harden ticket formatting (Bill JSON keys hien tai khong khop formatter)
- (Optional) ESC/POS TCP implementation behind config
- Frontend: Print status UI + print job polling
- (Optional, neu xac nhan) kitchen cancel print job khi cancel item sau khi sent
- Manual E2E test + buffer

---

## Task 0: Baseline Verify (No Code Changes Yet)

**Files:** none

- [ ] Step 1: Start DB

Run (repo root, PowerShell/WSL terminal ok):
```bash
docker compose up -d
```

- [ ] Step 2: Start API

Run:
```bash
cmd.exe /c "dotnet run --project apps\\api\\Restaurant.Api"
```

Expected: API healthy at `http://localhost:5141/health`.

- [ ] Step 3: Start web

Run:
```bash
cmd.exe /c "cd apps\\web && npm run dev"
```

- [ ] Step 4: Start print agent (mock)

Run:
```bash
cmd.exe /c "dotnet run --project apps\\print-agent\\Restaurant.PrintAgent"
```

- [ ] Step 5: Architecture verification (repo guardrail)

Run (repo root, PowerShell):
```bash
powershell -ExecutionPolicy Bypass -File scripts/verify-architecture.ps1
```

Expected: PASS.

---

## Task 1: Day 22-24 Hardening (Ticket Formatting + PrintKey Idempotency Checks)

**Files:**
- Modify: `apps/print-agent/Restaurant.PrintAgent/TicketFormatter.cs`
- (Optional) Modify: `apps/api/Restaurant.Api/Services/BillService.cs` (print_key uniqueness improvement)
- (Optional) Modify: `apps/api/Restaurant.Api/Services/OrderService.cs` (print_key formatting consistency)

- [ ] Step 1: (GitNexus) Impact analysis truoc khi sua symbol chinh

Targets (symbol names co the khac, tim dung symbol neu can):
- `Restaurant.PrintAgent.TicketFormatter.Format`
- `Restaurant.Api.Services.BillService.PayOrderAsync`
- `Restaurant.Api.Services.OrderService.SendToKitchenAsync`

Run (neu dung GitNexus MCP tools): `gitnexus_impact(..., direction: "upstream")` cho tung symbol.

Expected: low/medium. Neu HIGH/CRITICAL: stop va hoi truoc khi sua.

- [ ] Step 2: Update `TicketFormatter` de doc duoc ca camelCase va PascalCase keys

Implement theo huong "lenient parsing": uu tien key dung voi order payload (PascalCase) nhung fallback qua camelCase (bill payload hien tai).

Edit `TicketFormatter.cs` de:
- Accept: `TableName` or `tableName`
- Accept: `OrderId` or `orderId`
- Accept: `BillNumber` or `billNumber`
- Accept: `PaymentType` or `paymentType`
- Accept: `TotalAmount` or `totalAmount`
- Accept: `Items` or `items`
- Item name keys: `ItemNameSnapshot` or `itemName` (va fallback `ItemName`)
- Quantity keys: `Quantity` or `quantity`

Suggested helper (add inside class):
```csharp
private static bool TryGetString(JsonElement root, string a, string b, out string? value)
{
    if (root.TryGetProperty(a, out var p) && p.ValueKind == JsonValueKind.String)
    {
        value = p.GetString();
        return true;
    }
    if (root.TryGetProperty(b, out p) && p.ValueKind == JsonValueKind.String)
    {
        value = p.GetString();
        return true;
    }
    value = null;
    return false;
}
```

- [ ] Step 3: Smoke test mock printing with a paid bill

Manual:
1. Login -> tao order -> send to kitchen
2. Quan sat print-agent log co kitchen ticket
3. Pay order -> quan sat print-agent log co cashier bill ticket (co BillNumber/Payment)

- [ ] Step 4: Commit

```bash
git add apps/print-agent/Restaurant.PrintAgent/TicketFormatter.cs
git commit -m "fix: make ticket formatter tolerant of json key casing"
```

---

## Task 2: Day 25 (Optional Now): ESC/POS TCP/LAN Prototype Behind Config

> Neu chua co may in, task nay co the de sau. Neu lam, muc tieu la co code path Real mode, nhung van default Mock.

**Files:**
- Create: `apps/print-agent/Restaurant.PrintAgent/EscPosTcpPrinter.cs`
- Modify: `apps/print-agent/Restaurant.PrintAgent/PrintAgentOptions.cs`
- Modify: `apps/print-agent/Restaurant.PrintAgent/Worker.cs`
- Modify: `apps/print-agent/Restaurant.PrintAgent/appsettings.Development.json`

- [ ] Step 1: Add options for TCP printer

Add to `PrintAgentOptions`:
```csharp
public string? PrinterHost { get; set; }
public int PrinterPort { get; set; } = 9100;
```

- [ ] Step 2: Implement TCP sender

Create `EscPosTcpPrinter.cs`:
```csharp
using System.Net.Sockets;
using System.Text;
using Microsoft.Extensions.Options;

namespace Restaurant.PrintAgent;

public sealed class EscPosTcpPrinter
{
    private readonly PrintAgentOptions _options;

    public EscPosTcpPrinter(IOptions<PrintAgentOptions> options)
    {
        _options = options.Value;
    }

    public async Task SendAsync(string text, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.PrinterHost))
        {
            throw new InvalidOperationException("PrinterHost is not configured.");
        }

        using var client = new TcpClient();
        await client.ConnectAsync(_options.PrinterHost, _options.PrinterPort, cancellationToken);

        await using var stream = client.GetStream();
        // Minimal ESC/POS init + text + cut.
        var payload = Encoding.UTF8.GetBytes(text);
        var init = new byte[] { 0x1B, 0x40 };
        var cut = new byte[] { 0x1D, 0x56, 0x00 };

        await stream.WriteAsync(init, cancellationToken);
        await stream.WriteAsync(payload, cancellationToken);
        await stream.WriteAsync(cut, cancellationToken);
        await stream.FlushAsync(cancellationToken);
    }
}
```

- [ ] Step 3: Wire Worker: Mock logs, Real sends TCP

In `Worker.cs`, inject `EscPosTcpPrinter` and:
- If `_options.PrintMode == "Real"` (case-insensitive): call `SendAsync(ticket)`
- Else: log ticket as today

- [ ] Step 4: Update DI

In `Program.cs` add:
```csharp
builder.Services.AddSingleton<EscPosTcpPrinter>();
```

- [ ] Step 5: Update dev settings (keep Mock default)

Add keys in `appsettings.Development.json` (PrintAgent section):
```json
"PrinterHost": null,
"PrinterPort": 9100
```

- [ ] Step 6: Commit

```bash
git add apps/print-agent/Restaurant.PrintAgent
git commit -m "feat: add escpos tcp printer prototype behind config"
```

---

## Task 3: Day 26 API + Frontend: Print Status UI (Order + Bill)

**Files:**
- Create: `apps/web/src/features/print-jobs/api/printJobsApi.ts`
- Create: `apps/web/src/features/print-jobs/hooks/usePrintJobs.ts`
- Create: `apps/web/src/features/print-jobs/index.ts`
- Modify: `apps/api/Restaurant.Api/Controllers/PrintJobsController.cs`
- Modify: `apps/api/Restaurant.Api/Repositories/IPrintJobRepository.cs`
- Modify: `apps/api/Restaurant.Api/Repositories/PrintJobRepository.cs`
- Modify: `apps/api/Restaurant.Api/Services/IPrintJobService.cs`
- Modify: `apps/api/Restaurant.Api/Services/PrintJobService.cs`
- Modify: `apps/web/src/pages/waiter/WaiterOrderPage.tsx`
- Modify: `apps/web/src/pages/shared/BillDetailPage.tsx`
- Modify: `apps/web/src/i18n/locales/vi/orders.json`
- Modify: `apps/web/src/i18n/locales/en/orders.json`
- Modify: `apps/web/src/i18n/locales/vi/bills.json`
- Modify: `apps/web/src/i18n/locales/en/bills.json`

**Decision checkpoint:** De show print status ben vung sau reload, FE can endpoint lay print job moi nhat theo entity. Hien tai `PrintJobsController` chi co pending + mark endpoints. Ke hoach nay **mac dinh** se them API contract moi:
- `GET /api/print-jobs/latest?entityType=order&entityId={orderId}&printerType=Kitchen`
- `GET /api/print-jobs/latest?entityType=bill&entityId={billId}&printerType=Cashier`

Endpoint nay dung JWT auth (`WaiterOrAbove`) va filter theo `tenantContext.RequireTenantId()` trong service. Agent endpoints pending/mark van giu `X-Print-Agent-Key`.

- [ ] Step 1: (GitNexus) Impact analysis truoc khi sua print job service/repository/controller

Targets:
- `Restaurant.Api.Services.PrintJobService`
- `Restaurant.Api.Repositories.PrintJobRepository`
- `Restaurant.Api.Controllers.PrintJobsController`

Run: `gitnexus_impact(..., direction: "upstream")`.

Expected: low/medium. Neu HIGH/CRITICAL: stop va hoi truoc khi sua.

- [ ] Step 2: Backend repository supports latest print job by entity and tenant

**Files:**
- Modify: `apps/api/Restaurant.Api/Repositories/IPrintJobRepository.cs`
- Modify: `apps/api/Restaurant.Api/Repositories/PrintJobRepository.cs`

Add to `IPrintJobRepository.cs`:
```csharp
Task<PrintJob?> GetLatestByEntityAsync(
    Guid tenantId,
    string entityType,
    Guid entityId,
    PrinterType? printerType,
    CancellationToken cancellationToken = default);
```

Add to `PrintJobRepository.cs`:
```csharp
public Task<PrintJob?> GetLatestByEntityAsync(
    Guid tenantId,
    string entityType,
    Guid entityId,
    PrinterType? printerType,
    CancellationToken cancellationToken = default)
{
    var query = dbContext.PrintJobs
        .Where(x => x.TenantId == tenantId && x.EntityType == entityType && x.EntityId == entityId);

    if (printerType is not null)
    {
        query = query.Where(x => x.PrinterType == printerType);
    }

    return query
        .OrderByDescending(x => x.CreatedAt)
        .FirstOrDefaultAsync(cancellationToken);
}
```

- [ ] Step 3: Backend service exposes latest print job by entity

**Files:**
- Modify: `apps/api/Restaurant.Api/Services/IPrintJobService.cs`
- Modify: `apps/api/Restaurant.Api/Services/PrintJobService.cs`

Update constructor to inject `ITenantContext`:
```csharp
public sealed class PrintJobService(
    IPrintJobRepository printJobRepository,
    ITenantContext tenantContext) : IPrintJobService
```

Add interface method:
```csharp
Task<PrintJobResponse> GetLatestByEntityAsync(
    string entityType,
    Guid entityId,
    string? printerType,
    CancellationToken cancellationToken = default);
```

Add implementation:
```csharp
public async Task<PrintJobResponse> GetLatestByEntityAsync(
    string entityType,
    Guid entityId,
    string? printerType,
    CancellationToken cancellationToken = default)
{
    if (string.IsNullOrWhiteSpace(entityType))
    {
        throw new BusinessException("Entity type is required.");
    }

    PrinterType? parsedPrinterType = null;
    if (!string.IsNullOrWhiteSpace(printerType))
    {
        if (!Enum.TryParse<PrinterType>(printerType, true, out var value))
        {
            throw new BusinessException("Invalid printer type.");
        }

        parsedPrinterType = value;
    }

    var tenantId = tenantContext.RequireTenantId();
    var normalizedEntityType = entityType.Trim().ToLowerInvariant();
    if (normalizedEntityType is not ("order" or "bill" or "order_item_cancel"))
    {
        throw new BusinessException("Invalid entity type.");
    }

    var job = await printJobRepository.GetLatestByEntityAsync(
        tenantId,
        normalizedEntityType,
        entityId,
        parsedPrinterType,
        cancellationToken) ?? throw new NotFoundException("Print job not found.");

    return Map(job);
}
```

- [ ] Step 4: Backend controller adds JWT endpoint while preserving agent-key endpoints

**Files:**
- Modify: `apps/api/Restaurant.Api/Controllers/PrintJobsController.cs`

Add using:
```csharp
using Microsoft.AspNetCore.Authorization;
```

Add action:
```csharp
[Authorize(Policy = "WaiterOrAbove")]
[HttpGet("latest")]
public async Task<ActionResult<PrintJobResponse>> GetLatest(
    [FromQuery] string entityType,
    [FromQuery] Guid entityId,
    [FromQuery] string? printerType,
    CancellationToken cancellationToken = default)
{
    var result = await printJobService.GetLatestByEntityAsync(entityType, entityId, printerType, cancellationToken);
    return Ok(result);
}
```

- [ ] Step 5: Add minimal print-jobs api client

`printJobsApi.ts`:
```ts
import apiClient from '@/services/api'

export type PrintJob = {
  id: string
  entityType: string
  entityId: string
  printerType: string
  status: string
  errorMessage?: string | null
  retryCount: number
  printedAt?: string | null
  createdAt: string
  updatedAt: string
}

export const printJobsApi = {
  async latest(params: { entityType: 'order' | 'bill' | 'order_item_cancel'; entityId: string; printerType?: 'Kitchen' | 'Cashier' }) {
    const response = await apiClient.get<PrintJob>('/api/print-jobs/latest', { params })
    return response.data
  },
}
```

- [ ] Step 6: Implement frontend polling hook (2s interval)

`usePrintJobs.ts`:
```ts
import { useQuery } from '@tanstack/react-query'
import { printJobsApi } from '../api/printJobsApi'

export function useLatestPrintJob(params?: {
  entityType: 'order' | 'bill' | 'order_item_cancel'
  entityId: string
  printerType?: 'Kitchen' | 'Cashier'
}) {
  return useQuery({
    queryKey: ['printJob', 'latest', params?.entityType, params?.entityId, params?.printerType],
    queryFn: () => printJobsApi.latest(params!),
    enabled: !!params?.entityId,
    refetchInterval: 2000,
    retry: false,
  })
}
```

- [ ] Step 7: Render print status on UI

Add section:
- `WaiterOrderPage.tsx`: call `useLatestPrintJob({ entityType: 'order', entityId: order.id, printerType: 'Kitchen' })` when order status is `SentToKitchen` or `Paid`; show "Kitchen print: Pending/Printing/Printed/Failed".
- `BillDetailPage.tsx`: call `useLatestPrintJob({ entityType: 'bill', entityId: bill.id, printerType: 'Cashier' })`; show "Bill print: Pending/Printing/Printed/Failed", show retryCount + errorMessage if Failed.

Add i18n keys under existing namespaces:
- `orders.print.statusLabel`, `orders.print.status.pending|printing|printed|failed`
- `bills.print.statusLabel`, `bills.print.status.pending|...`

- [ ] Step 8: Frontend typecheck build

Run:
```bash
cmd.exe /c "cd apps\\web && npm run build"
```

- [ ] Step 9: Commit

```bash
git add apps/web/src apps/api/Restaurant.Api
git commit -m "feat: show print job status on order and bill pages"
```

---

## Task 4: Day 26 Backend (Optional, Needs Confirmation): Kitchen Cancel Print Job

**Decision:** Chi lam neu ban muon ho tro cancel item sau khi da sent to kitchen.

**Files:**
- Modify: `apps/api/Restaurant.Api/Services/OrderService.cs`
- Modify: `apps/api/Restaurant.Api/Repositories/OrderRepository.cs`

- [ ] Step 1: (GitNexus) Impact analysis truoc khi sua cancel order item flow

Targets:
- `Restaurant.Api.Services.OrderService.CancelItemAsync`
- `Restaurant.Api.Repositories.OrderRepository.GetItemByIdAsync`

Run: `gitnexus_impact(..., direction: "upstream")`.

Expected: low/medium. Neu HIGH/CRITICAL: stop va hoi truoc khi sua.

- [ ] Step 2: Include table context for sent-item cancel print content

Update `OrderRepository.GetItemByIdAsync` to include `Order.Table`:
```csharp
public Task<OrderItem?> GetItemByIdAsync(Guid itemId, CancellationToken cancellationToken = default)
    => dbContext.OrderItems
        .Include(x => x.Order)
        .ThenInclude(x => x.Table)
        .FirstOrDefaultAsync(x => x.Id == itemId, cancellationToken);
```

- [ ] Step 3: Update cancel rule

Allow cancel when item status is `Pending` **or** `SentToKitchen`.

- [ ] Step 4: When cancel after sent, create a kitchen cancel PrintJob

In `OrderService.CancelItemAsync`, immediately after loading `item` and before changing `item.Status`, add:
```csharp
var wasSentToKitchen = item.Status == OrderItemStatus.SentToKitchen;
```

Then after setting cancel fields:
```csharp
if (wasSentToKitchen)
{
    var content = new
    {
        tableName = item.Order.Table.Name,
        orderId = item.OrderId,
        itemName = item.ItemNameSnapshot,
        item.Quantity,
        reason = item.CancelReason,
        cancelledAt = item.CancelledAt
    };

    var printJob = new PrintJob
    {
        Id = Guid.NewGuid(),
        TenantId = tenantContext.RequireTenantId(),
        EntityType = "order_item_cancel",
        EntityId = item.Id,
        PrinterType = PrinterType.Kitchen,
        PrintKey = $"kitchen_cancel:{item.OrderId}:{item.Id}:{item.CancelledAt:yyyyMMddHHmmssfffffff}",
        Status = PrintJobStatus.Pending,
        ContentJson = JsonSerializer.Serialize(content),
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow
    };

    await orderRepository.AddPrintJobAsync(printJob, cancellationToken);
}
```

Expected JSON shape:
```json
{
  "tableName": "...",
  "orderId": "...",
  "itemName": "...",
  "quantity": 1,
  "reason": "...",
  "cancelledAt": "..."
}
```

- [ ] Step 5: Commit

```bash
git add apps/api/Restaurant.Api
git commit -m "feat: create kitchen cancel print jobs for sent items"
```

---

## Task 5: Day 27 Manual End-to-End Integration Test (Week 4 Checklist)

**Files:** none (unless bugfixes found)

- [ ] Step 1: Manual test script (run thru the UI)

1. Owner login -> create table, category, menu item
2. Waiter -> select table -> add items -> cancel one (with reason) -> add another -> send to kitchen
3. Verify: print agent picks up kitchen ticket (mock logs)
4. Cashier -> pay order (Cash)
5. Verify: print agent picks up cashier bill (mock logs)
6. Owner -> void bill (with reason)
7. Owner -> audit logs show actions
8. Owner -> daily report correct (revenue + void)

- [ ] Step 2: (If any fix) keep fixes small, commit as `fix: ...`

---

## Task 6: Day 28 Buffer + Verification + Scope Guard

**Files:** as-needed for bugfixes

- [ ] Step 1: Run architecture verification

```bash
powershell -ExecutionPolicy Bypass -File scripts/verify-architecture.ps1
```

- [ ] Step 2: Build API + print-agent + web (release sanity)

```bash
cmd.exe /c "dotnet build apps\\api\\Restaurant.Api\\Restaurant.Api.csproj"
cmd.exe /c "dotnet build apps\\print-agent\\Restaurant.PrintAgent\\Restaurant.PrintAgent.csproj"
cmd.exe /c "cd apps\\web && npm run build"
```

- [ ] Step 3: GitNexus detect changes before final commit/PR

Run:
```bash
npx gitnexus detect-changes
```

Expected: Only symbols/flows related to print jobs + UI status.

---

## Self-Review Checklist (Spec Coverage)

- [ ] Day 22: Print job polling endpoints present (pending + mark*)
- [ ] Day 23: SendToKitchen + PayOrder create print jobs with unique print_key
- [ ] Day 24: Print agent mock mode polls + marks states + handles errors
- [ ] Day 25: (Optional) ESC/POS TCP prototype behind config, mock still default
- [ ] Day 26: UI shows print status for order + bill (polling)
- [ ] Day 27: Manual full flow verified
- [ ] Day 28: Buffer fixes + verify-architecture + builds

---

## Execution Handoff

Plan saved to `docs/superpowers/plans/2026-05-04-week-4-print-agent-integration.md`.

Two execution options:

1. Subagent-Driven (recommended) - Use superpowers:subagent-driven-development
2. Inline Execution - Use superpowers:executing-plans

Which approach?
