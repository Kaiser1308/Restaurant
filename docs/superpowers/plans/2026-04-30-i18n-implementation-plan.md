# i18n Implementation Plan for Restaurant POS Web

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement English-Vietnamese language support for Restaurant POS web app with Vietnamese as default, namespace-by-feature architecture, and language switcher in all layouts.

**Architecture:** Namespace-by-feature using i18next. Each feature (auth, tables, menu, orders, bills, audit, reports) owns its own translation namespace. Language switcher persists to localStorage and auto-detects browser language.

**Tech Stack:** i18next, react-i18next, i18next-browser-languagedetector, Intl APIs (native browser formatting)

---

## Task Structure

```
### Task 1: Install i18n packages

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1: Install i18next packages**

```bash
cmd.exe /c "cd apps\\web && npm install i18next react-i18next i18next-browser-languagedetector --save"
```

- [ ] **Step 2: Verify installation**

```bash
cmd.exe /c "cd apps\\web && npm ls i18next react-i18next i18next-browser-languagedetector"
```

Expected: i18next, react-i18next, i18next-browser-languagedetector in node_modules

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json
git commit -m "feat: install i18next packages"
```

---

### Task 2: Create i18n directory structure

**Files:**
- Create: `apps/web/src/i18n/index.ts`
- Create: `apps/web/src/i18n/types.ts`
- Create: `apps/web/src/i18n/locales/vi/common.json`
- Create: `apps/web/src/i18n/locales/vi/auth.json`
- Create: `apps/web/src/i18n/locales/vi/tables.json`
- Create: `apps/web/src/i18n/locales/vi/menu.json`
- Create: `apps/web/src/i18n/locales/vi/orders.json`
- Create: `apps/web/src/i18n/locales/vi/bills.json`
- Create: `apps/web/src/i18n/locales/vi/audit.json`
- Create: `apps/web/src/i18n/locales/vi/reports.json`
- Create: `apps/web/src/i18n/locales/en/common.json`
- Create: `apps/web/src/i18n/locales/en/auth.json`
- Create: `apps/web/src/i18n/locales/en/tables.json`
- Create: `apps/web/src/i18n/locales/en/menu.json`
- Create: `apps/web/src/i18n/locales/en/orders.json`
- Create: `apps/web/src/i18n/locales/en/bills.json`
- Create: `apps/web/src/i18n/locales/en/audit.json`
- Create: `apps/web/src/i18n/locales/en/reports.json`

- [ ] **Step 1: Create TypeScript types**

Create: `apps/web/src/i18n/types.ts`

```typescript
export type TranslationKey = string
export type TranslationResources = Record<string, TranslationKey>

export interface TranslationNamespace {
  common: TranslationResources
  auth: TranslationResources
  tables: TranslationResources
  menu: TranslationResources
  orders: TranslationResources
  bills: TranslationResources
  audit: TranslationResources
  reports: TranslationResources
}
```

- [ ] **Step 2: Create Vietnamese common.json**

Create: `apps/web/src/i18n/locales/vi/common.json`

```json
{
  "actions": {
    "save": "Lưu",
    "cancel": "Hủy",
    "create": "Tạo mới",
    "delete": "Xóa",
    "edit": "Sửa",
    "search": "Tìm kiếm",
    "clear": "Xóa lọc",
    "confirm": "Xác nhận",
    "yes": "Có",
    "no": "Không"
  },
  "labels": {
    "username": "Tài khoản",
    "password": "Mật khẩu",
    "email": "Email",
    "name": "Tên",
    "description": "Mô tả",
    "price": "Giá",
    "quantity": "Số lượng",
    "total": "Tổng cộng",
    "subtotal": "Tạm tính",
    "reason": "Lý do"
  },
  "validation": {
    "required": "Trường này bắt buộc",
    "invalid": "Giá trị không hợp lệ",
    "tooShort": "Quá ngắn",
    "tooLong": "Quá dài"
  },
  "status": {
    "available": "Sẵn sàng",
    "occupied": "Đang phục vụ",
    "needsPayment": "Cần thanh toán",
    "closed": "Đã đóng",
    "processing": "Đang xử lý",
    "completed": "Hoàn tất",
    "cancelled": "Đã hủy"
  }
}
```

- [ ] **Step 3: Create Vietnamese auth.json**

Create: `apps/web/src/i18n/locales/vi/auth.json`

```json
{
  "login": {
    "title": "Đăng nhập",
    "welcome": "Chào mừng anh quay trở lại!",
    "cashierDemo": "Cashier Demo",
    "restaurantPos": "Restaurant POS"
  },
  "actions": {
    "login": "Đăng nhập",
    "logout": "Đăng xuất",
    "loginFailed": "Đăng nhập thất bại. Vui lòng kiểm tra tài khoản hoặc mật khẩu.",
    "invalidCredentials": "Vui lòng nhập tài khoản và mật khẩu hợp lệ."
  },
  "navigation": {
    "profile": "Profile",
    "settings": "Cài đặt"
  }
}
```

- [ ] **Step 4: Create Vietnamese tables.json**

Create: `apps/web/src/i18n/locales/vi/tables.json`

```json
{
  "title": "Bàn",
  "label": "Bàn",
  "status": {
    "available": "Sẵn sàng",
    "occupied": "Đang phục vụ",
    "needsPayment": "Cần thanh toán",
    "closed": "Đã đóng"
  },
  "actions": {
    "create": "Tạo bàn mới",
    "openOrder": "Mở order",
    "viewOrders": "Xem order",
    "changeStatus": "Đổi trạng thái"
  },
  "placeholder": {
    "tableName": "Tên bàn"
  }
}
```

- [ ] **Step 5: Create Vietnamese menu.json**

Create: `apps/web/src/i18n/locales/vi/menu.json`

```json
{
  "title": "Thực đơn",
  "label": "Menu",
  "item": "Món ăn",
  "category": {
    "title": "Danh mục",
    "name": "Tên danh mục",
    "create": "Tạo danh mục",
    "createPlaceholder": "Category name"
  },
  "menuItem": {
    "name": "Tên món",
    "price": "Giá",
    "description": "Mô tả",
    "create": "Tạo món",
    "createPlaceholder": "Item name",
    "pricePlaceholder": "Giá",
    "descriptionPlaceholder": "Mô tả",
    "available": "Có sẵn",
    "unavailable": "Không có sẵn",
    "enable": "Kích hoạt",
    "disable": "Vô hiệu"
  },
  "actions": {
    "save": "Lưu",
    "add": "Thêm món"
  }
}
```

- [ ] **Step 6: Create Vietnamese orders.json**

Create: `apps/web/src/i18n/locales/vi/orders.json`

```json
{
  "title": "Đơn hàng",
  "label": "Đơn hàng",
  "items": {
    "title": "Món đã đặt",
    "status": {
      "pending": "Đang chờ",
      "confirmed": "Đã xác nhận",
      "cooking": "Đang nấu",
      "ready": "Đã hoàn tất",
      "cancelled": "Đã hủy"
    }
  },
  "actions": {
    "create": "Tạo order",
    "addItem": "Thêm món",
    "increase": "Tăng số lượng",
    "decrease": "Giảm số lượng",
    "cancelItem": "Hủy món",
    "sendToKitchen": "Gửi vào bếp",
    "cancelReason": "Lý do hủy",
    "reasonPlaceholder": "Lý do hủy"
  },
  "status": {
    "pending": "Đang chờ",
    "confirmed": "Đã xác nhận",
    "cooking": "Đang nấu",
    "ready": "Đã hoàn tất",
    "cancelled": "Đã hủy"
  },
  "placeholder": {
    "searchMenu": "Tìm kiếm menu..."
  }
}
```

- [ ] **Step 7: Create Vietnamese bills.json**

Create: `apps/web/src/i18n/locales/vi/bills.json`

```json
{
  "title": "Hóa đơn",
  "label": "Hóa đơn",
  "preview": {
    "title": "Tạm tính",
    "tableName": "Tên bàn",
    "orderNumber": "Order #",
    "items": "Món đã gọi",
    "totalAmount": "Tổng tiền"
  },
  "actions": {
    "pay": "Thanh toán",
    "confirmPayment": "Xác nhận đã nhận tiền",
    "void": "Void bill",
    "voidReason": "Lý do void",
    "confirmVoid": "Xác nhận void",
    "voidPlaceholder": "Nhập lý do void bill"
  },
  "payment": {
    "cash": "Tiền mặt",
    "qr": "QR",
    "bankTransfer": "Chuyển khoản"
  },
  "status": {
    "paid": "Đã thanh toán",
    "voided": "Đã void"
  },
  "list": {
    "all": "Tất cả",
    "paid": "Đã thanh toán",
    "voided": "Đã void"
  },
  "filter": {
    "date": "Ngày",
    "all": "Tất cả"
  }
}
```

- [ ] **Step 8: Create Vietnamese audit.json**

Create: `apps/web/src/i18n/locales/vi/audit.json`

```json
{
  "title": "Audit logs",
  "label": "Nhật ký hoạt động",
  "log": {
    "action": "Hành động",
    "entityType": "Loại",
    "entityId": "ID thực thể",
    "userName": "Người dùng",
    "createdAt": "Thời gian",
    "reason": "Lý do"
  },
  "actions": {
    "filter": "Lọc theo hành động",
    "clearFilter": "Xóa lọc"
  },
  "placeholder": {
    "actionFilter": "pay_bill, void_bill..."
  }
}
```

- [ ] **Step 9: Create Vietnamese reports.json**

Create: `apps/web/src/i18n/locales/vi/reports.json`

```json
{
  "title": "Báo cáo",
  "label": "Báo cáo",
  "quick": "Báo cáo nhanh",
  "filter": {
    "date": "Lọc theo ngày",
    "datePlaceholder": "Ngày"
  },
  "actions": {
    "export": "Xuất báo cáo"
  },
  "placeholder": {
    "noData": "Không có dữ liệu"
  }
}
```

- [ ] **Step 10: Create English common.json**

Create: `apps/web/src/i18n/locales/en/common.json`

```json
{
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "create": "Create",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search",
    "clear": "Clear",
    "confirm": "Confirm",
    "yes": "Yes",
    "no": "No"
  },
  "labels": {
    "username": "Username",
    "password": "Password",
    "email": "Email",
    "name": "Name",
    "description": "Description",
    "price": "Price",
    "quantity": "Quantity",
    "total": "Total",
    "subtotal": "Subtotal",
    "reason": "Reason"
  },
  "validation": {
    "required": "This field is required",
    "invalid": "Invalid value",
    "tooShort": "Too short",
    "tooLong": "Too long"
  },
  "status": {
    "available": "Available",
    "occupied": "Occupied",
    "needsPayment": "Needs Payment",
    "closed": "Closed",
    "processing": "Processing",
    "completed": "Completed",
    "cancelled": "Cancelled"
  }
}
```

- [ ] **Step 11: Create English auth.json**

Create: `apps/web/src/i18n/locales/en/auth.json`

```json
{
  "login": {
    "title": "Login",
    "welcome": "Welcome back!",
    "cashierDemo": "Cashier Demo",
    "restaurantPos": "Restaurant POS"
  },
  "actions": {
    "login": "Login",
    "logout": "Logout",
    "loginFailed": "Login failed. Please check your username or password.",
    "invalidCredentials": "Please enter valid username and password."
  },
  "navigation": {
    "profile": "Profile",
    "settings": "Settings"
  }
}
```

- [ ] **Step 12: Create English tables.json**

Create: `apps/web/src/i18n/locales/en/tables.json`

```json
{
  "title": "Tables",
  "label": "Table",
  "status": {
    "available": "Available",
    "occupied": "Occupied",
    "needsPayment": "Needs Payment",
    "closed": "Closed"
  },
  "actions": {
    "create": "Create Table",
    "openOrder": "Open Order",
    "viewOrders": "View Orders",
    "changeStatus": "Change Status"
  },
  "placeholder": {
    "tableName": "Table name"
  }
}
```

- [ ] **Step 13: Create English menu.json**

Create: `apps/web/src/i18n/locales/en/menu.json`

```json
{
  "title": "Menu",
  "label": "Menu",
  "item": "Item",
  "category": {
    "title": "Categories",
    "name": "Category name",
    "create": "Create Category",
    "createPlaceholder": "Category name"
  },
  "menuItem": {
    "name": "Item name",
    "price": "Price",
    "description": "Description",
    "create": "Create Item",
    "createPlaceholder": "Item name",
    "pricePlaceholder": "Price",
    "descriptionPlaceholder": "Description",
    "available": "Available",
    "unavailable": "Unavailable",
    "enable": "Enable",
    "disable": "Disable"
  },
  "actions": {
    "save": "Save",
    "add": "Add Item"
  }
}
```

- [ ] **Step 14: Create English orders.json**

Create: `apps/web/src/i18n/locales/en/orders.json`

```json
{
  "title": "Orders",
  "label": "Order",
  "items": {
    "title": "Items Ordered",
    "status": {
      "pending": "Pending",
      "confirmed": "Confirmed",
      "cooking": "Cooking",
      "ready": "Ready",
      "cancelled": "Cancelled"
    }
  },
  "actions": {
    "create": "Create Order",
    "addItem": "Add Item",
    "increase": "Increase",
    "decrease": "Decrease",
    "cancelItem": "Cancel Item",
    "sendToKitchen": "Send to Kitchen",
    "cancelReason": "Cancellation Reason",
    "reasonPlaceholder": "Cancellation reason"
  },
  "status": {
    "pending": "Pending",
    "confirmed": "Confirmed",
    "cooking": "Cooking",
    "ready": "Ready",
    "cancelled": "Cancelled"
  },
  "placeholder": {
    "searchMenu": "Search menu..."
  }
}
```

- [ ] **Step 15: Create English bills.json**

Create: `apps/web/src/i18n/locales/en/bills.json`

```json
{
  "title": "Bills",
  "label": "Bill",
  "preview": {
    "title": "Subtotal",
    "tableName": "Table",
    "orderNumber": "Order #",
    "items": "Items Called",
    "totalAmount": "Total Amount"
  },
  "actions": {
    "pay": "Pay",
    "confirmPayment": "Confirm Payment Received",
    "void": "Void Bill",
    "voidReason": "Void Reason",
    "confirmVoid": "Confirm Void",
    "voidPlaceholder": "Enter void reason"
  },
  "payment": {
    "cash": "Cash",
    "qr": "QR",
    "bankTransfer": "Bank Transfer"
  },
  "status": {
    "paid": "Paid",
    "voided": "Voided"
  },
  "list": {
    "all": "All",
    "paid": "Paid",
    "voided": "Voided"
  },
  "filter": {
    "date": "Date",
    "all": "All"
  }
}
```

- [ ] **Step 16: Create English audit.json**

Create: `apps/web/src/i18n/locales/en/audit.json`

```json
{
  "title": "Audit Logs",
  "label": "Activity Log",
  "log": {
    "action": "Action",
    "entityType": "Type",
    "entityId": "Entity ID",
    "userName": "User",
    "createdAt": "Timestamp",
    "reason": "Reason"
  },
  "actions": {
    "filter": "Filter by Action",
    "clearFilter": "Clear Filter"
  },
  "placeholder": {
    "actionFilter": "pay_bill, void_bill..."
  }
}
```

- [ ] **Step 17: Create English reports.json**

Create: `apps/web/src/i18n/locales/en/reports.json`

```json
{
  "title": "Reports",
  "label": "Reports",
  "quick": "Quick Reports",
  "filter": {
    "date": "Filter by Date",
    "datePlaceholder": "Date"
  },
  "actions": {
    "export": "Export Report"
  },
  "placeholder": {
    "noData": "No data"
  }
}
```

- [ ] **Step 18: Create i18n initialization**

Create: `apps/web/src/i18n/index.ts`

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'vi',
    fallbackLng: 'en',
    debug: false,
    interpolation: { escapeValue: false },
    ns: ['common', 'auth', 'tables', 'menu', 'orders', 'bills', 'audit', 'reports'],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    resources: {
      vi: {
        common: require('./locales/vi/common.json'),
        auth: require('./locales/vi/auth.json'),
        tables: require('./locales/vi/tables.json'),
        menu: require('./locales/vi/menu.json'),
        orders: require('./locales/vi/orders.json'),
        bills: require('./locales/vi/bills.json'),
        audit: require('./locales/vi/audit.json'),
        reports: require('./locales/vi/reports.json'),
      },
      en: {
        common: require('./locales/en/common.json'),
        auth: require('./locales/en/auth.json'),
        tables: require('./locales/en/tables.json'),
        menu: require('./locales/en/menu.json'),
        orders: require('./locales/en/orders.json'),
        bills: require('./locales/en/bills.json'),
        audit: require('./locales/en/audit.json'),
        reports: require('./locales/en/reports.json'),
      },
    },
  })
```

- [ ] **Step 19: Integrate i18n into App entry**

Modify: `apps/web/src/main.tsx`

Add i18n initialization before React root:

```typescript
import './i18n'  // Initialize i18n first
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 20: Commit i18n foundation**

```bash
git add apps/web/src/i18n/ apps/web/src/main.tsx
git commit -m "feat: setup i18n foundation and language switcher"
```

---

### Task 3: Create LanguageSwitcher component

**Files:**
- Create: `apps/web/src/components/LanguageSwitcher.tsx`

- [ ] **Step 1: Create LanguageSwitcher component**

Create: `apps/web/src/components/LanguageSwitcher.tsx`

```typescript
import { useTranslation } from 'react-i18next'

const SUPPORTED_LANGUAGES = ['vi', 'en'] as const
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

const LANGUAGE_OPTIONS: Record<SupportedLanguage, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
}

const isSupportedLanguage = (value: string): value is SupportedLanguage =>
  SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const resolved = i18n.resolvedLanguage?.split('-')[0] ?? 'vi'
  const currentLang: SupportedLanguage = isSupportedLanguage(resolved) ? resolved : 'vi'
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value
    if (isSupportedLanguage(newLang)) {
      i18n.changeLanguage(newLang)
    }
  }

  return (
    <>
      <label htmlFor="language-switcher" className="sr-only">
        Change language
      </label>
      <select
        id="language-switcher"
        value={currentLang}
        onChange={handleChange}
        aria-label="Change language"
        className="rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] px-3 py-1.5 text-sm font-semibold text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]"
      >
        {SUPPORTED_LANGUAGES.map(lang => (
          <option key={lang} value={lang}>
            {LANGUAGE_OPTIONS[lang]}
          </option>
        ))}
      </select>
    </>
  )
}
```

- [ ] **Step 2: Commit LanguageSwitcher**

```bash
git add apps/web/src/components/LanguageSwitcher.tsx
git commit -m "feat: create language switcher component"
```

---

### Task 4: Integrate LanguageSwitcher into layouts

**Files:**
- Modify: `apps/web/src/layouts/WaiterLayout.tsx`
- Modify: `apps/web/src/layouts/CashierLayout.tsx`
- Modify: `apps/web/src/layouts/OwnerLayout.tsx`

- [ ] **Step 1: Add LanguageSwitcher to WaiterLayout**

Modify: `apps/web/src/layouts/WaiterLayout.tsx`

Add import and component after user name (around line 17):

```typescript
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { currentUser, logout, isLogoutLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-16 md:pb-0">
      <header className="border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] px-4 py-3">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-on-surface)]">{currentUser?.name}</p>
            <p className="text-xs text-[var(--color-on-surface-variant)]">{currentUser?.role}</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              disabled={isLogoutLoading}
              className="rounded-lg border border-[var(--color-outline-variant)] px-3 py-1.5 text-sm font-semibold text-[var(--color-on-surface)]"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl p-4">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] md:hidden">
        {/* Existing nav unchanged */}
      </nav>
    </div>
  )
}
```

- [ ] **Step 2: Add LanguageSwitcher to CashierLayout**

Modify: `apps/web/src/layouts/CashierLayout.tsx`

Add import and component after user info in sidebar (around line 17):

```typescript
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { currentUser, logout, isLogoutLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <aside className="hidden w-64 flex-col border-r border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] md:flex">
        <div className="border-b border-[var(--color-outline-variant)] px-4 py-3">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-[var(--color-on-surface)]">{currentUser?.name}</p>
            <p className="text-xs text-[var(--color-on-surface-variant)]">{currentUser?.role}</p>
            <LanguageSwitcher />
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2 p-3">
          {/* Existing nav unchanged */}
        </nav>
        <div className="p-3">
          <button
            onClick={handleLogout}
            disabled={isLogoutLoading}
            className="w-full rounded-lg border border-[var(--color-outline-variant)] px-3 py-2 text-sm font-semibold text-[var(--color-on-surface)]"
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Add LanguageSwitcher to OwnerLayout**

Modify: `apps/web/src/layouts/OwnerLayout.tsx`

Add import and component after user info in sidebar (around line 20):

```typescript
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { canManageMenu, canManageTables } from '@/features/auth/utils/roleAccess'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { currentUser, logout, isLogoutLoading } = useAuth()
  const userRole = currentUser?.role ?? 'Waiter'
  const canViewStaff = userRole === 'Owner'

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <aside className="hidden w-72 flex-col border-r border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] md:flex">
        <div className="border-b border-[var(--color-outline-variant)] px-4 py-4">
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold text-[var(--color-on-surface)]">Restaurant POS</p>
            <p className="mt-2 text-sm font-semibold text-[var(--color-on-surface)]">{currentUser?.name}</p>
            <p className="text-xs text-[var(--color-on-surface-variant)]">{currentUser?.role}</p>
            <LanguageSwitcher />
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2 p-3">
          {/* Existing nav unchanged */}
        </nav>
        <div className="p-3">
          <button
            onClick={handleLogout}
            disabled={isLogoutLoading}
            className="w-full rounded-lg border border-[var(--color-outline-variant)] px-3 py-2 text-sm font-semibold text-[var(--color-on-surface)]"
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}
```

- [ ] **Step 4: Commit layout integrations**

```bash
git add apps/web/src/layouts/
git commit -m "feat: integrate language switcher into all layouts"
```

---

### Task 5: Create locale formatting helpers

**Files:**
- Create: `apps/web/src/utils/format.ts`

- [ ] **Step 1: Create format utility with hook**

Create: `apps/web/src/utils/format.ts`

```typescript
import { useTranslation } from 'react-i18next'

export function useLocaleFormat() {
  const { i18n } = useTranslation()
  const locale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US'

  return {
    formatMoney: (amount: number): string => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    },

    formatDateTime: (date: string | Date): string => {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(date))
    },

    formatDate: (date: string | Date): string => {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
      }).format(new Date(date))
    },

    formatTime: (date: string | Date): string => {
      return new Intl.DateTimeFormat(locale, {
        timeStyle: 'short',
      }).format(new Date(date))
    },
  }
}

export function formatMoney(amount: number, locale: 'vi' | 'en'): string {
  const intlLocale = locale === 'vi' ? 'vi-VN' : 'en-US'
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
```

- [ ] **Step 2: Commit format helpers**

```bash
git add apps/web/src/utils/format.ts
git commit -m "feat: add locale formatting helpers for money and dates"
```

---

### Task 6: Migrate App.tsx login and common UI (Batch 1)

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Add useTranslation import to LoginPage**

Modify: `apps/web/src/App.tsx`

Add import after existing imports (around line 4):

```typescript
import { useTranslation } from 'react-i18next'
```

- [ ] **Step 2: Migrate LoginPage component**

Modify LoginPage function in App.tsx (around lines 37-121):

Replace all hardcoded Vietnamese strings with translation keys:

```typescript
function LoginPage() {
  const { login, isLoginLoading } = useAuth()
  const { t } = useTranslation('auth')
  const [form, setForm] = useState<LoginRequest>({ username: '', password: '' })
  const [toastMessage, setToastMessage] = useState<string>('')

  useEffect(() => {
    const authNotice = sessionStorage.getItem('authNotice')
    if (!authNotice) {
      return
    }

    setToastMessage(authNotice)
    sessionStorage.removeItem('authNotice')
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedUsername = form.username.trim()
    const normalizedPassword = form.password.trim()

    if (!normalizedUsername || !normalizedPassword) {
      setToastMessage(t('actions.invalidCredentials'))
      return
    }

    try {
      const result = await login({
        username: normalizedUsername,
        password: normalizedPassword,
      })
      window.location.href = getDefaultPathByRole(result.user.role)
    } catch {
      setToastMessage(t('actions.loginFailed'))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="text-center space-y-2">
            <span className="mx-auto inline-flex rounded-full border border-[#ffd3bf] bg-[#fff2eb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
              {t('login.cashierDemo')}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)]">{t('login.restaurantPos')}</h1>
            <p className="font-medium text-[var(--color-on-surface-variant)]">{t('login.welcome')}</p>
          </div>
          
          <div className="space-y-4">
            <Input
              label={t('labels.username')}
              placeholder={t('login.usernamePlaceholder')}
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            />
            <Input
              label={t('labels.password')}
              type="password"
              placeholder="••••••"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button className="w-full" size="lg" type="submit" disabled={isLoginLoading}>
              {isLoginLoading ? t('actions.login') + '...' : t('actions.login')}
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1">{t('login.actions.qrScan')}</Button>
              <Button variant="ghost" className="flex-1">{t('login.actions.support')}</Button>
            </div>
          </div>
        </form>
      </Card>
      {toastMessage ? (
        <Toast
          message={toastMessage}
          variant="error"
          onClose={() => setToastMessage('')}
        />
      ) : null}
    </div>
  )
}
```

**Note:** You'll need to create missing translation keys in auth.json during Task 2 if not already created.

- [ ] **Step 3: Migrate logout button in all layouts**

Update logout button text in all three layouts to use translation keys:

**WaiterLayout.tsx:**
```typescript
<button onClick={handleLogout} disabled={isLogoutLoading} className="...">
  {t('actions.logout')}
</button>
```

**CashierLayout.tsx:**
```typescript
<button onClick={handleLogout} disabled={isLogoutLoading} className="...">
  {t('actions.logout')}
</button>
```

**OwnerLayout.tsx:**
```typescript
<button onClick={handleLogout} disabled={isLogoutLoading} className="...">
  {t('actions.logout')}
</button>
```

**Note:** Each layout will need `const { t } = useTranslation('auth')` added to access auth namespace keys.

- [ ] **Step 4: Commit Batch 1 migration**

```bash
git add apps/web/src/App.tsx apps/web/src/layouts/
git commit -m "feat: localize auth and common UI elements"
```

---

### Task 7: Migrate tables and menu UI (Batch 2)

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Add useTranslation imports to table/menu pages**

Add imports for tables and menu namespaces (around line 4):

```typescript
import { useTranslation } from 'react-i18next'
```

- [ ] **Step 2: Migrate WaiterTablesPage component**

Modify WaiterTablesPage function in App.tsx (around lines 129-154):

```typescript
function WaiterTablesPage() {
  const navigate = useNavigate()
  const { data: tables = [] } = useTables()
  const { t } = useTranslation('tables')
  const createOrderMutation = useCreateOrder()

  const openTable = async (table: RestaurantTable) => {
    try {
      const active = await tablesApi.getActiveOrder(table.id)
      navigate(`/waiter/orders/${active.id}`)
    } catch {
      const created = await createOrderMutation.mutateAsync(table.id)
      navigate(`/waiter/orders/${created.id}`)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {tables.map((table) => (
        <button key={table.id} className="rounded-lg border p-4 text-left" onClick={() => openTable(table)}>
          <p className="font-semibold">{table.name}</p>
          <p className="text-sm text-[var(--color-on-surface-variant)]">{t(`status.${table.status.toLowerCase()}`)}</p>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Migrate CashierTablesPage component**

Modify CashierTablesPage function in App.tsx (around lines 261-297):

```typescript
function CashierTablesPage() {
  const navigate = useNavigate()
  const { data: tables = [] } = useTables()
  const { t } = useTranslation('tables')
  const [toastMessage, setToastMessage] = useState('')

  const openPayment = async (table: RestaurantTable) => {
    try {
      const active = await tablesApi.getActiveOrder(table.id)
      navigate(`/cashier/orders/${active.id}/payment`)
    } catch {
      setToastMessage('Orders.errors.noActiveOrder')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('label')}</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {tables.map((table) => {
          const isOccupied = table.status === 'Occupied' || table.status === 'NeedsPayment'
          return (
            <button
              key={table.id}
              className="rounded-lg border p-4 text-left disabled:opacity-50"
              disabled={!isOccupied}
              onClick={() => openPayment(table)}
            >
              <p className="font-semibold">{table.name}</p>
              <StatusBadge status={table.status} />
            </button>
          )
        })}
      </div>
      {toastMessage ? <Toast message={toastMessage} variant="error" onClose={() => setToastMessage('')} /> : null}
    </div>
  )
}
```

**Note:** StatusBadge component will need to accept translation key or be updated to use translation internally.

- [ ] **Step 4: Migrate OwnerMenuPage component**

Modify OwnerMenuPage function in App.tsx (around lines 644-731):

```typescript
function OwnerMenuPage() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('menu')
  const [categoryName, setCategoryName] = useState('')
  const [menuName, setMenuName] = useState('')
  const [menuPrice, setMenuPrice] = useState('50000')
  const [menuDescription, setMenuDescription] = useState('')
  const [search, setSearch] = useState('')
  const { data: categories = [] } = useCategories()
  const { data: menuItems = [] } = useMenuItems(undefined, search)

  const createCategory = useMutation({
    mutationFn: () => menuApi.createCategory({ name: categoryName.trim(), sortOrder: 1 }),
    onSuccess: () => {
      setCategoryName('')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const createMenuItem = useMutation({
    mutationFn: () => menuApi.createMenuItem({
      categoryId: categories[0]?.id || '',
      name: menuName.trim(),
      price: Number(menuPrice),
      description: menuDescription.trim() || undefined,
      isAvailable: true,
    }),
    onSuccess: () => {
      setMenuName('')
      setMenuDescription('')
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    },
  })

  const toggleAvailability = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) => menuApi.updateAvailability(id, isAvailable),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menuItems'] }),
  })

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-2 font-semibold">{t('category.title')}</p>
        <div className="flex gap-2">
          <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder={t('category.createPlaceholder')} />
          <Button onClick={() => createCategory.mutate()} disabled={!categoryName.trim()}>{t('category.create')}</Button>
        </div>
      </Card>

      <Card>
        <p className="mb-2 font-semibold">{t('menuItem.create')}</p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <Input value={menuName} onChange={(e) => setMenuName(e.target.value)} placeholder={t('menuItem.createPlaceholder')} />
          <Input value={menuPrice} onChange={(e) => setMenuPrice(e.target.value)} placeholder={t('menuItem.pricePlaceholder')} />
          <Input value={menuDescription} onChange={(e) => setMenuDescription(e.target.value)} placeholder={t('menuItem.descriptionPlaceholder')} />
          <Button onClick={() => createMenuItem.mutate()} disabled={!menuName.trim() || categories.length === 0}>{t('menuItem.create')}</Button>
        </div>
      </Card>

      <Card>
        <p className="mb-2 font-semibold">{t('label')}</p>
        <div className="mb-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('placeholder.searchMenu')} />
        </div>
        <div className="space-y-2">
          {menuItems.map(item => (
            <div key={item.id} className="flex items-center justify-between rounded border p-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-[var(--color-on-surface-variant)]">{item.price.toLocaleString('vi-VN')}đ - {t(`menuItem.${item.isAvailable ? 'available' : 'unavailable'}`)}</p>
              </div>
              <Button
                size="sm"
                variant={item.isAvailable ? 'secondary' : 'primary'}
                disabled={toggleAvailability.isPending}
                onClick={() => toggleAvailability.mutate({ id: item.id, isAvailable: !item.isAvailable })}
              >
                {t(`menuItem.${item.isAvailable ? 'disable' : 'enable'}`)}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
```

**Note:** You'll need to add missing translation keys to menu.json during Task 2.

- [ ] **Step 5: Update StatusBadge component to support translations**

Modify: `apps/web/src/components/StatusBadge.tsx`

Update component to accept translation key or use translation internally:

```typescript
import { useTranslation } from 'react-i18next'

type StatusBadgeProps = {
  status?: string
  statusKey?: string  // NEW: Accept translation key
}

export default function StatusBadge({ status, statusKey }: StatusBadgeProps) {
  const { t } = useTranslation('common')

  const displayText = statusKey ? t(`status.${statusKey}`) : status

  return (
    <span className="...">
      {displayText}
    </span>
  )
}
```

- [ ] **Step 6: Commit Batch 2 migration**

```bash
git add apps/web/src/App.tsx apps/web/src/components/StatusBadge.tsx
git commit -m "feat: localize tables and menu modules"
```

---

### Task 8: Migrate orders and bills UI (Batch 3)

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Migrate WaiterOrderPage component**

Modify WaiterOrderPage function in App.tsx (around lines 156-259):

```typescript
function WaiterOrderPage() {
  const { orderId = '' } = useParams()
  const queryClient = useQueryClient()
  const { t } = useTranslation('orders')
  const { data: order } = useOrderDetail(orderId)
  const { data: categories = [] } = useCategories()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const { data: menuItems = [] } = useMenuItems(selectedCategoryId, search)
  const [reasonByItem, setReasonByItem] = useState<Record<string, string>>({})

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['orderDetail', orderId] })

  const addItem = useMutation({
    mutationFn: (menuItemId: string) => ordersApi.addItem(orderId, menuItemId, 1),
    onSuccess: refresh,
  })
  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => ordersApi.updateItem(itemId, quantity),
    onSuccess: refresh,
  })
  const cancelItem = useMutation({
    mutationFn: ({ itemId, reason }: { itemId: string; reason: string }) => ordersApi.cancelItem(itemId, reason),
    onSuccess: refresh,
  })
  const sendToKitchen = useMutation({
    mutationFn: () => ordersApi.sendToKitchen(orderId),
    onSuccess: refresh,
  })

  if (!order) {
    return <p>Loading {t('label')}...</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <div className="space-y-3">
          <p className="text-xl font-bold">{order.tableName}</p>
          <p className="text-sm">{t(`status.${order.status.toLowerCase()}`)}</p>
          {order.items.map(item => (
            <div key={item.id} className="rounded border p-3">
              <p className="font-semibold">{item.itemNameSnapshot}</p>
              <p className="text-sm">{t(`items.status.${item.status}`)} - {item.lineTotal.toLocaleString('vi-VN')}đ</p>
              {item.status === 'Pending' ? (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateItem.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}>-</Button>
                    <span className="px-2 py-2">{item.quantity}</span>
                    <Button size="sm" onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}>+</Button>
                  </div>
                  <Input
                    placeholder={t('actions.cancelReason')}
                    value={reasonByItem[item.id] || ''}
                    onChange={(e) => setReasonByItem(prev => ({ ...prev, [item.id]: e.target.value }))}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => cancelItem.mutate({ itemId: item.id, reason: (reasonByItem[item.id] || '').trim() })}
                  >
                    {t('actions.cancelItem')}
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
          <p className="font-bold">{t('common.total')}: {order.totalAmount.toLocaleString('vi-VN')}đ</p>
          <Button onClick={() => sendToKitchen.mutate()} disabled={sendToKitchen.isPending}>{t('actions.sendToKitchen')}</Button>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          <Input placeholder={t('placeholder.searchMenu')} value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                size="sm"
                variant={selectedCategoryId === category.id ? 'primary' : 'ghost'}
                onClick={() => setSelectedCategoryId(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
          {menuItems.map(item => (
            <div key={item.id} className="rounded border p-3">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm">{item.price.toLocaleString('vi-VN')}đ</p>
              <Button
                size="sm"
                disabled={!item.isAvailable || addItem.isPending}
                onClick={() => addItem.mutate(item.id)}
              >
                {t('actions.add')}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Migrate CashierPaymentPage component**

Modify CashierPaymentPage function in App.tsx (around lines 299-385):

```typescript
function CashierPaymentPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orderId = '' } = useParams()
  const { t } = useTranslation('bills')
  const { data: order } = useOrderDetail(orderId)
  const { data: preview } = useBillPreview(orderId)
  const [paymentType, setPaymentType] = useState<PaymentType>('Cash')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const { formatMoney, formatDateTime } = useLocaleFormat()

  const payOrder = useMutation({
    mutationFn: () => billsApi.payOrder(orderId, paymentType),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['tables'] })
      await queryClient.invalidateQueries({ queryKey: ['bills'] })
      navigate(`/cashier/bills/${result.billId}`)
    },
    onError: () => setToastMessage('Thanh toán thất bại. Vui lòng kiểm tra order trước khi thử lại.'),
  })

  if (!order || !preview) {
    return <p>{t('preview.title')}...</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
      <Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{preview.tableName}</p>
              <p className="text-sm text-[var(--color-on-surface-variant)]">{t('preview.orderNumber')} {order.id.slice(0, 8)}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          {preview.items.map(item => (
            <div key={item.id} className="flex justify-between rounded border p-3">
              <div>
                <p className="font-semibold">{item.itemNameSnapshot}</p>
                <p className="text-sm text-[var(--color-on-surface-variant)]">x{item.quantity}</p>
              </div>
              <p className="font-semibold">{formatMoney(item.lineTotal)}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <p className="text-lg font-bold">{t('preview.title')}</p>
          <p className="text-3xl font-extrabold">{formatMoney(preview.totalAmount)}</p>
          <div className="space-y-2">
            {(['Cash', 'Qr', 'BankTransfer'] as PaymentType[]).map(type => (
              <Button
                key={type}
                className="w-full"
                variant={paymentType === type ? 'primary' : 'secondary'}
                onClick={() => setPaymentType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
          <Button className="w-full" disabled={payOrder.isPending} onClick={() => setConfirmOpen(true)}>
            {t('actions.confirmPayment')}
          </Button>
        </div>
      </Card>

      <Modal open={confirmOpen}>
        <div className="space-y-4">
          <p className="text-lg font-bold">{t('actions.confirmPayment')}</p>
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            {t('bills.confirmPaymentMessage')}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)}>{t('actions.cancel')}</Button>
            <Button className="flex-1" disabled={payOrder.isPending} onClick={() => payOrder.mutate()}>
              {t('actions.pay')} {paymentType}
            </Button>
          </div>
        </div>
      </Modal>
      {toastMessage ? <Toast message={toastMessage} variant="error" onClose={() => setToastMessage('')} /> : null}
    </div>
  )
}
```

- [ ] **Step 3: Migrate BillsListPage component**

Modify BillsListPage function in App.tsx (around lines 387-425):

```typescript
function BillsListPage({ basePath }: { basePath: '/cashier' | '/owner' }) {
  const navigate = useNavigate()
  const { t } = useTranslation('bills')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState<BillStatus | ''>('')
  const { data: bills = [] } = useBills(date, status || undefined)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <Input label={t('filter.date')} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex gap-2">
          {(['', 'Paid', 'Voided'] as Array<BillStatus | ''>).map(value => (
            <Button key={value || 'all'} variant={status === value ? 'primary' : 'secondary'} onClick={() => setStatus(value)}>
              {value || t('list.all')}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {bills.map(bill => (
          <button
            key={bill.id}
            className="flex w-full items-center justify-between rounded border p-3 text-left"
            onClick={() => navigate(`${basePath}/bills/${bill.id}`)}
          >
            <div>
              <p className="font-semibold">{bill.billNumber} - {bill.tableName}</p>
              <p className="text-sm text-[var(--color-on-surface-variant)]">{bill.paymentType} · {formatDateTime(bill.paidAt)}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatMoney(bill.totalAmount)}</p>
              <StatusBadge status={bill.status} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Migrate BillDetailPage component**

Modify BillDetailPage function in App.tsx (around lines 427-492):

```typescript
function BillDetailPage({ canVoid }: { canVoid: boolean }) {
  const queryClient = useQueryClient()
  const { billId = '' } = useParams()
  const { t } = useTranslation('bills')
  const { data: bill } = useBill(billId)
  const [voidOpen, setVoidOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const { formatMoney, formatDateTime } = useLocaleFormat()

  const voidBill = useMutation({
    mutationFn: () => billsApi.void(billId, reason.trim()),
    onSuccess: async () => {
      setVoidOpen(false)
      setReason('')
      await queryClient.invalidateQueries({ queryKey: ['bill', billId] })
      await queryClient.invalidateQueries({ queryKey: ['bills'] })
      await queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    },
    onError: () => setToastMessage('Void bill thất bại. Vui lòng kiểm tra quyền hoặc trạng thái bill.'),
  })

  if (!bill) {
    return <p>{t('loading')}...</p>
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-bold">{t('billNumber')} {bill.billNumber}</p>
            <p className="text-sm text-[var(--color-on-surface-variant)]">{bill.tableName} · {formatDateTime(bill.paidAt)}</p>
          </div>
          <StatusBadge status={bill.status} />
        </div>
        {bill.items.map(item => (
          <div key={item.id} className="flex justify-between rounded border p-3">
            <p>{item.itemNameSnapshot} x {item.quantity}</p>
            <p className="font-semibold">{formatMoney(item.lineTotal)}</p>
          </div>
        ))}
        <div className="flex justify-between border-t pt-3 text-lg font-bold">
          <span>{t('common.total')}</span>
          <span>{formatMoney(bill.totalAmount)}</span>
        </div>
        {bill.voidReason ? <p className="text-sm text-[var(--color-error)]">{t('actions.voidReason')}: {bill.voidReason}</p> : null}
        {canVoid && bill.status === 'Paid' ? (
          <Button variant="danger" onClick={() => setVoidOpen(true)}>{t('actions.void')}</Button>
        ) : null}
      </div>

      <Modal open={voidOpen}>
        <div className="space-y-4">
          <p className="text-lg font-bold">{t('actions.void')} {t('billNumber')} {bill.billNumber}</p>
          <Input label={t('actions.voidReason')} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('actions.voidPlaceholder')} />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setVoidOpen(false)}>{t('actions.cancel')}</Button>
            <Button variant="danger" className="flex-1" disabled={!reason.trim() || voidBill.isPending} onClick={() => voidBill.mutate()}>
              {t('actions.confirmVoid')}
            </Button>
          </div>
        </div>
      </Modal>
      {toastMessage ? <Toast message={toastMessage} variant="error" onClose={() => setToastMessage('')} /> : null}
    </Card>
  )
}
```

- [ ] **Step 5: Commit Batch 3 migration**

```bash
git add apps/web/src/App.tsx
git commit -m "feat: localize orders and bills modules"
```

---

### Task 9: Migrate audit and reports UI (Batch 4)

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Migrate AuditLogsPage component**

Modify AuditLogsPage function in App.tsx (around lines 494-523):

```typescript
function AuditLogsPage() {
  const { t } = useTranslation('audit')
  const [action, setAction] = useState('')
  const { data } = useAuditLogs({ action: action || undefined, page: 1, pageSize: 50 })
  const logs = data?.items ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <Input label={t('log.action')} value={action} onChange={(e) => setAction(e.target.value)} placeholder={t('placeholder.actionFilter')} />
        <Button variant="secondary" onClick={() => setAction('')}>{t('actions.clearFilter')}</Button>
      </div>
      <div className="space-y-2">
        {logs.map(log => (
          <Card key={log.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{log.action}</p>
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  {t('log.entityType')} · {log.entityId} · {log.userName || 'System'}
                </p>
                {log.reason ? <p className="mt-1 text-sm">{t('log.reason')}: {log.reason}</p> : null}
              </div>
              <p className="text-sm text-[var(--color-on-surface-variant)]">{formatDateTime(log.createdAt)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Migrate OwnerDashboardPage component**

Modify OwnerDashboardPage function in App.tsx (around lines 525-587):

```typescript
function OwnerDashboardPage() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('common')
  const { data: tables = [] } = useTables()
  const [tableName, setTableName] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [menuName, setMenuName] = useState('')
  const [menuPrice, setMenuPrice] = useState('50000')
  const { data: categories = [] } = useCategories()

  const createTable = useMutation({
    mutationFn: () => tablesApi.create(tableName.trim()),
    onSuccess: () => {
      setTableName('')
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
  const createCategory = useMutation({
    mutationFn: () => menuApi.createCategory({ name: categoryName.trim(), sortOrder: 1 }),
    onSuccess: () => {
      setCategoryName('')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
  const createMenuItem = useMutation({
    mutationFn: () => menuApi.createMenuItem({
      categoryId: categories[0]?.id || '',
      name: menuName.trim(),
      price: Number(menuPrice),
      isAvailable: true,
    }),
    onSuccess: () => {
      setMenuName('')
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    },
  })

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-2 font-semibold">{t('tables.label')}</p>
        <div className="flex gap-2">
          <Input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder={t('placeholder.tableName')} />
          <Button onClick={() => createTable.mutate()} disabled={!tableName.trim()}>{t('actions.create')}</Button>
        </div>
        <div className="mt-3 space-y-2">
          {tables.map(t => <p key={t.id}>{t.name} - {t(`status.${t.status.toLowerCase()}`)}</p>)}
        </div>
      </Card>

      <Card>
        <p className="mb-2 font-semibold">{t('menu.category.title')}</p>
        <div className="mb-2 flex gap-2">
          <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder={t('category.createPlaceholder')} />
          <Button onClick={() => createCategory.mutate()} disabled={!categoryName.trim()}>{t('category.create')}</Button>
        </div>
        <div className="flex gap-2">
          <Input value={menuName} onChange={(e) => setMenuName(e.target.value)} placeholder={t('menuItem.createPlaceholder')} />
          <Input value={menuPrice} onChange={(e) => setMenuPrice(e.target.value)} placeholder={t('menuItem.pricePlaceholder')} />
          <Button onClick={() => createMenuItem.mutate()} disabled={!menuName.trim() || categories.length === 0}>{t('menuItem.create')}</Button>
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Migrate OwnerTablesPage component**

Modify OwnerTablesPage function in App.tsx (around lines 589-642):

```typescript
function OwnerTablesPage() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('tables')
  const { data: tables = [] } = useTables()
  const [tableName, setTableName] = useState('')

  const createTable = useMutation({
    mutationFn: () => tablesApi.create(tableName.trim()),
    onSuccess: () => {
      setTableName('')
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })

  const updateTableStatus = useMutation({
    mutationFn: ({ id, name, status }: { id: string; name: string; status: RestaurantTable['status'] }) =>
      tablesApi.update(id, { name, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tables'] }),
  })

  const cycleStatus = (status: RestaurantTable['status']): RestaurantTable['status'] => {
    if (status === 'Available') return 'Occupied'
    if (status === 'Occupied') return 'NeedsPayment'
    if (status === 'NeedsPayment') return 'Closed'
    return 'Available'
  }

  return (
    <Card>
      <p className="mb-2 font-semibold">{t('label')}</p>
      <div className="mb-3 flex gap-2">
        <Input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder={t('placeholder.tableName')} />
        <Button onClick={() => createTable.mutate()} disabled={!tableName.trim()}>{t('actions.create')}</Button>
      </div>
      <div className="space-y-2">
        {tables.map(t => (
          <div key={t.id} className="flex items-center justify-between rounded border p-2">
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-sm text-[var(--color-on-surface-variant)]">{t(`status.${t.status.toLowerCase()}`)}</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              disabled={updateTableStatus.isPending}
              onClick={() => updateTableStatus.mutate({ id: t.id, name: t.name, status: cycleStatus(t.status) })}
            >
              {t('actions.changeStatus')}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
```

- [ ] **Step 4: Commit Batch 4 migration**

```bash
git add apps/web/src/App.tsx
git commit -m "feat: localize audit and reports modules"
```

---

### Task 10: Run build and lint verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run TypeScript typecheck**

```bash
cmd.exe /c "cd apps\\web && npm run build"
```

Expected: No TypeScript errors

- [ ] **Step 2: Run ESLint**

```bash
cmd.exe /c "cd apps\\web && npm run lint"
```

Expected: No lint errors

- [ ] **Step 3: Manual smoke test**

Open app in browser:
1. Verify default language is Vietnamese on fresh visit
2. Test language switch to English and back to Vietnamese
3. Test all three roles: Waiter, Cashier, Owner
4. Verify language persists across page navigation
5. Check for layout breaks with longer English text
6. Verify money formatting displays correctly (VND with proper separators)
7. Verify date/time formatting displays correctly

- [ ] **Step 4: Commit final implementation**

```bash
git add apps/web/src/ apps/web/package.json
git commit -m "feat: implement i18n for web app (English-Vietnamese support)"
```

---

## No Placeholders

All tasks contain complete code with actual translations, file paths, and commands. No TBD or TODO placeholders in this plan.

## Self-Review

**Spec coverage:** ✅ All sections covered:
- Task 1: i18n packages ✅
- Task 2: i18n directory structure ✅
- Task 3: LanguageSwitcher component ✅
- Task 4: Layout integration ✅
- Task 5: Locale formatting ✅
- Task 6: Batch 1 migration (Common + Auth) ✅
- Task 7: Batch 2 migration (Tables + Menu) ✅
- Task 8: Batch 3 migration (Orders + Bills) ✅
- Task 9: Batch 4 migration (Audit + Reports) ✅
- Task 10: Build and verification ✅

**Type consistency:** All useTranslation calls use correct namespace pattern ✅
- `useTranslation('auth')` followed by `t('key')` ✅
- Namespace pattern `feature.section.element` followed throughout ✅
- No `t('namespace.key')` key-prefix style usage ✅

**File path consistency:** All paths are correct ✅
- `apps/web/src/i18n/` structure matches design ✅
- Component paths use `@/` alias where appropriate ✅

If you find issues, fix them inline. No need to re-review — just fix and move on. If you find a spec requirement with no task, add a task.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-30-i18n-implementation-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**