# Nhiệm vụ đang làm (Active Tasks)

Dùng để xé nhỏ `PHASE_1_TASKS.md` thành các việc chi tiết của ngày hôm nay.

## Task: Day 3 - Auth Schema & Seed Data
**Status:** 🔄 In Progress

### Yêu cầu
Thiết lập EF Core, tạo các bảng Auth cơ bản và Seed dữ liệu mẫu để có thể login.

### Checklist (Để giao cho AI)
- [x] **Backend:** Cài đặt EF Core packages (Npgsql, EFCore.NamingConventions).
- [x] **Backend:** Tạo các Entity: `Tenant`, `User`, `RefreshToken` (Tuân thủ DB_SCHEMA_V1.md).
- [x] **Backend:** Tạo `RestaurantDbContext` (Cấu hình snake_case và Enum-to-String).
- [ ] **Backend:** Tạo và chạy Migration đầu tiên. *(Blocked: môi trường hiện tại không chạy được `dotnet` từ session agent)*
- [x] **Backend:** Viết `SeedService` tạo Tenant & Admin mặc định (Password phải được Hash).
- [x] **Backend:** Đảm bảo quá trình Seed là Idempotent (không tạo trùng dữ liệu khi chạy lại).

Acceptance:
- Migration chạy thành công, bảng xuất hiện trong PostgreSQL.
- Có dữ liệu Tenant và Owner trong DB.

Commit: `feat: add auth schema and seed default tenant/owner`
