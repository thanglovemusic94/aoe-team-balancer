# 🖼️ Hướng Dẫn Tạo Ảnh Open Graph

## Vấn đề hiện tại
Zalo có thể không hiển thị ảnh SVG hoặc cần thời gian cache. Cần tạo ảnh PNG.

## Cách tạo ảnh PNG:

### 1. Sử dụng file generate-png.html
1. Mở file `public/generate-png.html` trong browser
2. Click nút "Tải ảnh PNG"
3. Lưu file thành `og-image.png` trong thư mục `public/`

### 2. Sử dụng tool online
1. Vào https://www.canva.com/ hoặc https://www.figma.com/
2. Tạo ảnh 1200x630px
3. Background: Gradient xanh (#3B82F6 → #1E40AF)
4. Text: "🎮 AOE Team Balancer"
5. Subtitle: "Chia Team Cân Bằng Ngẫu Nhiên"
6. Features: "🏛️ Trụ Cột | ⚖️ Trung Bình | 🤝 Hỗ Trợ"
7. Export thành PNG

### 3. Sử dụng AI
1. Dùng ChatGPT, Claude, hoặc Midjourney
2. Prompt: "Create a 1200x630px social media preview image for AOE Team Balancer app. Blue gradient background, game controller icon, Vietnamese text about team balancing"

## Kiểm tra
Sau khi tạo ảnh PNG:
1. Đặt file vào `public/og-image.png`
2. Commit và push
3. Test trên Zalo sau 5-10 phút
