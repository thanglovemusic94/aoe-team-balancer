# 🔐 Hướng Dẫn Cài Đặt Admin

## Cách Thay Đổi Password Admin

### 1. Thay đổi password trong file config
Mở file `config/admin.js` và thay đổi:

```javascript
export const ADMIN_CONFIG = {
  PASSWORD: 'your_new_password_here', // Thay đổi password ở đây
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
  MAX_LOGIN_ATTEMPTS: 5
}
```

### 2. Thêm nhiều admin (tùy chọn)
Bạn có thể thêm nhiều admin trong `ADMIN_USERS`:

```javascript
export const ADMIN_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'super_admin'
  },
  {
    username: 'moderator', 
    password: 'mod123',
    role: 'moderator'
  }
]
```

## Bảo Mật

### ✅ Khuyến nghị:
- Sử dụng password mạnh (ít nhất 8 ký tự, có số và ký tự đặc biệt)
- Thay đổi password định kỳ
- Không commit password vào Git
- Sử dụng environment variables cho production

### ❌ Tránh:
- Password đơn giản như "123456", "password"
- Hardcode password trong code
- Chia sẻ password qua email/chat

## Environment Variables (Nâng cao)

Để bảo mật hơn, bạn có thể sử dụng environment variables:

1. Tạo file `.env.local`:
```
ADMIN_PASSWORD=your_secure_password
```

2. Cập nhật `config/admin.js`:
```javascript
export const ADMIN_CONFIG = {
  PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  // ...
}
```

## Deploy lên Vercel

Khi deploy lên Vercel, thêm environment variable:
1. Vào Vercel Dashboard
2. Chọn project
3. Settings > Environment Variables
4. Thêm `ADMIN_PASSWORD` với giá trị mong muốn
