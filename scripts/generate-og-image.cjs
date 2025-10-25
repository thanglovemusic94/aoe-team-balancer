const fs = require('fs');
const path = require('path');

// Tạo HTML cho Open Graph image
const ogImageHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AOE Team Balancer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; padding: 0; }
        .og-container { 
            width: 1200px; 
            height: 630px; 
            background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
        }
    </style>
</head>
<body>
    <div class="og-container">
        <div class="text-center">
            <div class="text-8xl mb-6">🎮</div>
            <h1 class="text-6xl font-bold mb-4">AOE Team Balancer</h1>
            <p class="text-2xl mb-6 opacity-90">Chia Team Cân Bằng Ngẫu Nhiên</p>
            <div class="flex justify-center space-x-8 text-xl">
                <div class="flex items-center space-x-2">
                    <span>🏛️</span>
                    <span>Trụ Cột</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span>⚖️</span>
                    <span>Trung Bình</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span>🤝</span>
                    <span>Hỗ Trợ</span>
                </div>
            </div>
            <div class="mt-8 text-lg opacity-75">
                Thuật toán tiên tiến • Cân bằng hoàn hảo • Dễ sử dụng
            </div>
        </div>
    </div>
</body>
</html>`;

// Lưu file HTML
const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'og-image.html'), ogImageHTML);

console.log('✅ Đã tạo og-image.html');
console.log('📝 Để tạo ảnh PNG, bạn có thể:');
console.log('1. Mở og-image.html trong browser');
console.log('2. Chụp màn hình hoặc dùng tool online');
console.log('3. Lưu thành og-image.png (1200x630px)');
