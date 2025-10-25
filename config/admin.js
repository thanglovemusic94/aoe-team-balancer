// Admin configuration - Password khác nhau cho local và production
export const ADMIN_CONFIG = {
  // Local: admin123, Production: admin1234 (từ Vercel env var)
  PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  
  // Có thể thêm các cấu hình khác
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  MAX_LOGIN_ATTEMPTS: 5
}

// Có thể thêm nhiều admin nếu cần
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
