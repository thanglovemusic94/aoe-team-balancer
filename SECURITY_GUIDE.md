# 🔒 Hướng Dẫn Bảo Mật

## ⚠️ Vấn Đề Bảo Mật

**KHÔNG BAO GIỜ** để password thật trong code vì:
- Source code có thể bị public trên GitHub
- Ai cũng có thể xem được password
- Rất nguy hiểm cho production

## ✅ Giải Pháp Bảo Mật

### 1. Sử dụng Environment Variables

**Tạo file `.env.local` (không commit vào Git):**
```bash
# Tạo file .env.local
ADMIN_PASSWORD=your_super_secure_password_123
NODE_ENV=production
```

**Cập nhật `.gitignore` để bỏ qua file .env:**
```gitignore
# Environment variables
.env
.env.local
.env.production
```

### 2. Cách Deploy An Toàn

#### **Vercel:**
1. Vào Vercel Dashboard
2. Chọn project → Settings → Environment Variables
3. Thêm: `ADMIN_PASSWORD` = `your_secure_password`
4. Deploy lại

#### **Netlify:**
1. Site settings → Environment variables
2. Thêm: `ADMIN_PASSWORD` = `your_secure_password`

#### **Railway/Render:**
1. Project settings → Environment
2. Thêm: `ADMIN_PASSWORD` = `your_secure_password`

### 3. Password Mạnh

**✅ Tốt:**
- `AOE2024!Team#Balancer`
- `MySecure@Pass123`
- `Admin!2024#AOE`

**❌ Tránh:**
- `admin123`
- `password`
- `123456`
- `admin`

### 4. Kiểm Tra Bảo Mật

**Trước khi deploy:**
- [ ] Không có password trong code
- [ ] File .env.local không commit
- [ ] Environment variables đã set
- [ ] Password đủ mạnh

## 🛡️ Cấp Độ Bảo Mật

### **Level 1: Cơ bản**
- Password trong environment variable
- Không commit .env files

### **Level 2: Nâng cao**
- Hash password với bcrypt
- Session timeout
- Rate limiting

### **Level 3: Enterprise**
- OAuth/SSO
- 2FA
- Audit logs

## 📝 Checklist Deploy

- [ ] Tạo password mạnh
- [ ] Set environment variable
- [ ] Test login trên production
- [ ] Xóa password khỏi code
- [ ] Commit .gitignore
- [ ] Deploy và test
