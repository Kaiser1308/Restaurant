---
name: Modern Vietnamese POS
colors:
  primary: '#FF4500' # Màu đỏ cam chủ đạo mới
  surface: '#f8faf7'
  surface-dim: '#d8dbd8'
  surface-bright: '#f8faf7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f1'
  surface-container: '#ecefec'
  surface-container-high: '#e1e4e1'
  surface-container-highest: '#d8dbd8'
  on-surface: '#181d18'
  on-surface-variant: '#414941'
  outline: '#717970'
  outline-variant: '#c1c9be'
  primary-container: '#004D40'
  on-primary-container: '#ffffff'
  secondary: '#FF8C00'
  secondary-container: '#FFF3E0'
  error: '#BA1A1A'
  warning: '#FFC107'
  success: '#4CAF50'
  info: '#2196F3'

typography:
  font-family: 'Be Vietnam Pro', sans-serif
  headings:
    display: 'bold 32px'
    title: 'semibold 20px'
    subtitle: 'medium 16px'
  body:
    large: 'regular 16px'
    medium: 'regular 14px'
    small: 'regular 12px'

shapes:
  corner-radius: 8px
  button-radius: 12px
  card-radius: 16px

components:
  sidebar:
    width: 220px
    background: '#FF4500'
    text: '#FFFFFF'
  top-bar:
    height: 64px
    background: '#FFFFFF'
  table-card:
    states:
      available: 'gray-100'
      occupied: 'amber-100'
      reserved: 'yellow-100'
      attention: 'red-border'
---

# Hướng dẫn thiết kế (Design Guidelines)

Hệ thống POS nhà hàng Việt hiện đại tập trung vào sự tối giản, hiệu quả và tính thẩm mỹ cao.

1. **Màu sắc:** Sử dụng màu đỏ cam (#FF4500) làm điểm nhấn chính cho sidebar và các nút hành động quan trọng để tạo cảm giác năng động và ngon miệng. Các màu sắc chức năng (xanh lá cho thành công, vàng cho cảnh báo, đỏ cho lỗi) được sử dụng để truyền tải trạng thái bàn và bếp.

2. **Phông chữ:** 'Be Vietnam Pro' được chọn vì tính hiện đại và khả năng hiển thị tiếng Việt tuyệt vời trên cả màn hình máy tính và thiết bị di động.

3. **Giao diện người dùng (UI):** Sử dụng các thẻ (cards) có góc bo tròn để tạo cảm giác thân thiện và hiện đại. Khoảng trắng được sử dụng rộng rãi để giảm bớt sự lộn xộn trong môi trường nhà hàng bận rộn.

4. **Trải nghiệm người dùng (UX):** Các mục tiêu chạm trên thiết bị di động được đảm bảo tối thiểu 44px để phục vụ nhân viên phục vụ thao tác nhanh. Các quy trình quan trọng như thanh toán và hủy món được thiết kế rõ ràng với các bước xác nhận cần thiết.
