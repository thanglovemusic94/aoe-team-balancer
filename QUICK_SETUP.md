# 🚀 Setup Nhanh - Bảo Mật

## 1. Tạo Password An Toàn

**Tạo file `.env.local`:**
```bash
# Tạo file .env.local trong thư mục gốc
ADMIN_PASSWORD=YourSecurePassword123!
NODE_ENV=production
```

## 2. Test Local

```bash
npm run dev
# Mở http://localhost:3000
# Test login với password vừa tạo
```

## 3. Deploy Vercel

**Cách 1: Vercel CLI**
```bash
# Set environment variable
vercel env add ADMIN_PASSWORD
# Nhập password khi được hỏi
vercel --prod
```

**Cách 2: Vercel Dashboard**
1. Vào https://vercel.com/dashboard
2. Chọn project → Settings → Environment Variables
3. Thêm: `ADMIN_PASSWORD` = `YourSecurePassword123!`
4. Deploy lại

## 4. Kiểm Tra

- [ ] Login được với password mới
- [ ] Password không hiện trong source code
- [ ] Production hoạt động bình thường

## ⚠️ Lưu Ý Quan Trọng

- **KHÔNG** commit file `.env.local`
- **KHÔNG** để password trong code
- **LUÔN** sử dụng password mạnh
- **KIỂM TRA** trước khi deploy
