# Nhiệm vụ đang làm (Active Tasks)

Dùng để xé nhỏ `PHASE_1_TASKS.md` thành các việc chi tiết của ngày hôm nay.

## Task: Day 7 - Week 1 Review & Stabilize
**Status:** ✅ Done

---

## Task: Day 8 - Tables & Menu Schema (Backend)
**Status:** ✅ Done

### Yêu cầu
Thiết kế cơ sở dữ liệu cho Sơ đồ bàn và Thực đơn.

### Checklist
- [x] **Backend:** Tạo entities/enums: `RestaurantTable`, `Category`, `MenuItem`, `Order`, `OrderItem`, `AuditLog`.
- [x] **Backend:** Tạo repositories/services cho tables, categories, menu items, orders.
- [x] **Database:** Tạo migration `Day8To13CoreFlow`.
- [x] **Backend:** Thêm Global Query Filter cho `tenant_id` trên bảng nghiệp vụ mới.

---

## Task: Day 9 - Table Management API & UI
**Status:** ✅ Done

### Checklist
- [x] **Backend:** API Tables (`GET`, `POST`, `PATCH`) với policy Owner/Manager.
- [x] **Frontend:** Bảng/lưới bàn cho luồng chọn bàn.
- [x] **Frontend:** Hiển thị trạng thái bàn theo dữ liệu API.

---

## Task: Day 10 - Menu Management API & UI
**Status:** ✅ Done

### Checklist
- [x] **Backend:** API Categories/MenuItems (`GET`, `POST`, `PATCH`, `availability`).
- [x] **Frontend:** Trang quản lý menu cơ bản cho Owner/Manager (thêm category/item).
- [x] **Frontend:** Màn hình duyệt menu cho Waiter (tabs + search + add item).

---

## Task: Day 11 - Cart & Ordering Logic (Frontend)
**Status:** ✅ Done

### Checklist
- [x] **Frontend:** Logic order hiện tại theo bàn (active order/create order).
- [x] **Frontend:** Thêm món, tăng/giảm số lượng, hủy món với reason.
- [x] **Frontend:** Luồng bắt buộc chọn bàn trước khi thao tác order.

---

## Task: Day 12 - Order API (Backend Core)
**Status:** ✅ Done

### Checklist
- [x] **Backend:** Entity `Order`, `OrderItem` đã triển khai.
- [x] **Backend:** API order core (`create`, `detail`, `add item`, `update item`, `cancel item`).
- [x] **Backend:** Ràng buộc nghiệp vụ 1 active order/bàn và cập nhật trạng thái bàn.

---

## Task: Day 13 - End-to-End Ordering Test 🎯 (ĐIỂM TEST QUAN TRỌNG)
**Status:** ✅ Done

### Yêu cầu
Kết nối toàn bộ các mảnh ghép để anh có thể test thực tế trên giao diện.

### Checklist
- [x] **Frontend:** Trang chi tiết order hiện tại của bàn.
- [x] **Frontend:** Nút "Send to Kitchen" gọi API `POST /api/orders/{id}/send-to-kitchen`.
- [x] **Integration:** Kitchen display polling 2s theo active orders.

Acceptance:
- Nhân viên bồi bàn thực hiện xong 1 chu kỳ gọi món trên điện thoại.
- Dữ liệu xuất hiện chính xác trong Database.

Commit: `feat: finalize core ordering flow end-to-end`
