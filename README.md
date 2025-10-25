# 🎮 AOE Team Balancer

Công cụ chia team cân bằng ngẫu nhiên cho Age of Empires được xây dựng với Nuxt.js.

## ✨ Tính Năng

- **Upload File Excel**: Hỗ trợ đọc file .xlsx và .xls
- **Thuật Toán Cân Bằng**: Chia team theo phương pháp cân bằng có yếu tố ngẫu nhiên
- **Giao Diện Đẹp**: Responsive design với Tailwind CSS
- **Hiển Thị Chi Tiết**: Thống kê và phân tích kết quả chia team

## 🚀 Cài Đặt

```bash
# Clone repository
git clone <repository-url>
cd aoe-team-balancer

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

## 📊 Cấu Trúc File Excel

File Excel cần có cấu trúc như sau:

| Cột A (Điểm) | Cột B (Tên) |
|-------------|-------------|
| 23          | Player1     |
| 22          | Player2     |
| ...         | ...         |
| 1           | Player28    |

**Yêu cầu:**
- Đúng 28 người chơi
- Điểm từ 1-23
- Có thể có header row

## 🎯 Thuật Toán Chia Team

### Phân Loại Người Chơi
- **Nhóm A (Trụ Cột)**: Rank 17-23 (7 người)
- **Nhóm B (Trung Bình)**: Rank 7-16 (10 người)  
- **Nhóm C (Hỗ Trợ)**: Rank 1-6 (11 người)

### Quy Trình Chia Team
1. **Xáo trộn nhóm A** và gán 1 trụ cột/team
2. **Phân bổ ngẫu nhiên** nhóm B và C vào 7 team
3. **Cân bằng điểm** để đạt mục tiêu 42-46 điểm/team
4. **Hiển thị kết quả** với thống kê chi tiết

## 🛠️ Công Nghệ Sử Dụng

- **Nuxt.js 3**: Framework Vue.js
- **Tailwind CSS**: Styling framework
- **SheetJS (xlsx)**: Đọc file Excel
- **Vue 3 Composition API**: Quản lý state

## 📁 Cấu Trúc Project

```
aoe-team-balancer/
├── app/
│   └── app.vue              # Main application
├── components/
│   ├── FileUpload.vue       # Upload Excel component
│   ├── PlayerList.vue       # Display players
│   ├── TeamBalancer.vue     # Team generation algorithm
│   └── TeamResults.vue      # Results display
├── assets/
│   └── css/
│       └── main.css         # Tailwind CSS
├── public/
│   └── sample-data.xlsx     # Sample Excel file
└── scripts/
    └── create-sample-data.js # Generate sample data
```

## 🎲 Cách Sử Dụng

1. **Upload File**: Chọn file Excel chứa 28 người chơi
2. **Kiểm Tra Dữ Liệu**: Xem danh sách người chơi đã được phân loại
3. **Chia Team**: Nhấn "Quay Random 7 Đội Cân Bằng"
4. **Xem Kết Quả**: Kiểm tra 7 team với thống kê chi tiết
5. **Chia Lại**: Có thể chia lại team nếu không hài lòng

## 🎯 Mục Tiêu Cân Bằng

- **Tổng điểm mỗi team**: 42-46 điểm
- **Chênh lệch tối đa**: < 5 điểm giữa các team
- **Phân bổ đều**: Mỗi team có 1 trụ cột + 3 thành viên khác

## 🔧 Development

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 License

MIT License - Xem file LICENSE để biết thêm chi tiết.