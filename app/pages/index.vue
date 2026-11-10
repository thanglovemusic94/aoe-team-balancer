<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
             <header class="text-center mb-8">
               <div v-if="loginEnabled" class="flex justify-between items-center mb-4">
                 <div></div>
                 <div class="flex items-center space-x-4">
                   <div v-if="isAdmin" class="flex items-center space-x-2">
                     <span class="text-green-600 font-semibold">👑 Admin</span>
                     <button
                       @click="handleAdminLogout"
                       class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                     >
                       Đăng xuất
                     </button>
                   </div>
                   <button
                     v-else
                     @click="showLoginModal = true"
                     class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
                   >
                     🔐 Đăng nhập Admin
                   </button>
                 </div>
               </div>
               <h1 class="text-4xl font-bold text-gray-800 mb-2">
                 🎮 AOE Team Balancer
               </h1>
               <p class="text-lg text-gray-600 mb-6">
                 Công cụ chia team cân bằng ngẫu nhiên cho Age of Empires
               </p>
               
               <!-- Hệ thống chấm điểm -->
               <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mb-8 max-w-5xl mx-auto">
                 <!-- Header có thể click để toggle -->
                 <div 
                   @click="toggleScoringSystem"
                   class="p-6 cursor-pointer hover:bg-blue-100 transition-colors rounded-t-xl"
                   :class="{ 'rounded-xl': !showScoringSystem }"
                 >
                   <h2 class="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
                     <span>📊</span>
                     <span>Hệ Thống Chấm Điểm & Phân Loại</span>
                     <span class="text-2xl transition-transform duration-200 ml-4" :class="{ 'rotate-180': showScoringSystem }">
                       ▼
                     </span>
                   </h2>
                 </div>
                 
                 <!-- Nội dung có thể thu gọn -->
                 <div v-show="showScoringSystem" class="px-6 pb-6">
                 
                 <p v-if="rosterScale.min != null" class="text-sm text-gray-600 text-center mb-4">
                   Hạng chia theo điểm hiện tại: thấp nhất {{ rosterScale.min }}, cao nhất {{ rosterScale.max }}.
                 </p>
                 <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                   <div
                     v-for="grade in rosterScale.bands"
                     :key="grade.id"
                     class="rounded-xl border bg-white p-4 text-center shadow-sm"
                   >
                     <div class="text-2xl font-bold" :class="grade.textClass">{{ grade.label }}</div>
                     <div class="text-sm text-gray-500 mb-2">{{ grade.rangeLabel }} điểm</div>
                     <div class="text-3xl font-bold text-gray-800">{{ countByGrade(rankedPlayers, grade.id, rosterScale.bands) }}</div>
                     <div class="text-xs text-gray-500">người chơi</div>
                   </div>
                 </div>
                 
                 <!-- Thống kê tổng quan -->
                 <div v-if="players.length > 0" class="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                   <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                     📈 Thống Kê Hiện Tại
                   </h4>
                   <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                     <div class="bg-blue-50 rounded-lg p-3">
                       <div class="text-2xl font-bold text-blue-600">{{ players.length }}</div>
                       <div class="text-sm text-gray-600">Tổng người chơi</div>
                     </div>
                     <div class="bg-purple-50 rounded-lg p-3">
                       <div class="text-2xl font-bold text-purple-600">{{ Math.floor(players.length / 4) }}</div>
                       <div class="text-sm text-gray-600">Số team có thể tạo</div>
                     </div>
                     <div class="bg-orange-50 rounded-lg p-3">
                       <div class="text-2xl font-bold text-orange-600">{{ getAveragePoints().toFixed(1) }}</div>
                       <div class="text-sm text-gray-600">Điểm trung bình</div>
                     </div>
                     <div class="bg-indigo-50 rounded-lg p-3">
                       <div class="text-2xl font-bold text-indigo-600">{{ getTotalPoints() }}</div>
                       <div class="text-sm text-gray-600">Tổng điểm</div>
                     </div>
                   </div>
                 </div>
                 
                 <!-- Thuật toán cân bằng -->
                 <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mt-6 border-2 border-purple-200 shadow-lg">
                   <h3 class="text-2xl font-bold text-purple-800 mb-4 flex items-center justify-center gap-2">
                     <span>🧠</span>
                     <span>Thuật Toán Cân Bằng Tiên Tiến</span>
                   </h3>
                   
                   <!-- Thông số kỹ thuật -->
                   <div class="bg-white rounded-lg p-5 mb-5 border-2 border-purple-100">
                     <h4 class="text-lg font-bold text-purple-700 mb-4 flex items-center gap-2">
                       <span>⚙️</span>
                       <span>Thông Số Kỹ Thuật & Lý Do Chọn</span>
                     </h4>
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <!-- 15,000 lần thử -->
                       <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
                         <div class="flex items-center gap-3 mb-3">
                           <div class="bg-blue-200 p-3 rounded-full">
                             <span class="text-2xl font-bold text-blue-800">15,000</span>
                           </div>
                           <div>
                             <div class="font-bold text-blue-800">Lần thử nghiệm</div>
                             <div class="text-sm text-blue-600">Simulated Annealing</div>
                           </div>
                         </div>
                         <div class="space-y-2 text-sm text-gray-700">
                           <div class="flex items-start gap-2">
                             <span class="text-blue-600 mt-0.5">📊</span>
                             <span><strong>Với 28 người:</strong> Có thể chia thành 10^15 cách khác nhau</span>
                           </div>
                           <div class="flex items-start gap-2">
                             <span class="text-blue-600 mt-0.5">⚡</span>
                             <span><strong>15,000 lần:</strong> Đủ để tìm giải pháp tốt trong < 1 giây</span>
                           </div>
                           <div class="flex items-start gap-2">
                             <span class="text-blue-600 mt-0.5">🎯</span>
                             <span><strong>Dừng sớm:</strong> Tìm thấy giải pháp tốt thì dừng ngay</span>
                           </div>
                         </div>
                       </div>
                       
                       <!-- 0.95 hệ số làm mát -->
                       <div class="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200">
                         <div class="flex items-center gap-3 mb-3">
                           <div class="bg-green-200 p-3 rounded-full">
                             <span class="text-2xl font-bold text-green-800">0.95</span>
                           </div>
                           <div>
                             <div class="font-bold text-green-800">Hệ số làm mát</div>
                             <div class="text-sm text-green-600">Cooling Rate</div>
                           </div>
                         </div>
                         <div class="space-y-2 text-sm text-gray-700">
                           <div class="flex items-start gap-2">
                             <span class="text-green-600 mt-0.5">🔥</span>
                             <span><strong>Ban đầu:</strong> Chấp nhận nhiều cách chia "tệ" để khám phá</span>
                           </div>
                           <div class="flex items-start gap-2">
                             <span class="text-green-600 mt-0.5">❄️</span>
                             <span><strong>Dần dần:</strong> Chỉ chấp nhận cách chia tốt hơn</span>
                           </div>
                           <div class="flex items-start gap-2">
                             <span class="text-green-600 mt-0.5">⚖️</span>
                             <span><strong>0.95:</strong> Giảm nhiệt độ vừa phải, không quá nhanh/chậm</span>
                           </div>
                         </div>
                       </div>
                       
                       <!-- 1000°C nhiệt độ ban đầu -->
                       <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-lg border border-yellow-200">
                         <div class="flex items-center gap-3 mb-3">
                           <div class="bg-yellow-200 p-3 rounded-full">
                             <span class="text-2xl font-bold text-yellow-800">1000°C</span>
                           </div>
                           <div>
                             <div class="font-bold text-yellow-800">Nhiệt độ ban đầu</div>
                             <div class="text-sm text-yellow-600">Initial Temperature</div>
                           </div>
                         </div>
                         <div class="space-y-2 text-sm text-gray-700">
                           <div class="flex items-start gap-2">
                             <span class="text-yellow-600 mt-0.5">🌡️</span>
                             <span><strong>Nhiệt độ cao:</strong> Dễ chấp nhận giải pháp "tệ" ban đầu</span>
                           </div>
                           <div class="flex items-start gap-2">
                             <span class="text-yellow-600 mt-0.5">🔍</span>
                             <span><strong>Khám phá rộng:</strong> Tìm kiếm trong không gian giải pháp lớn</span>
                           </div>
                           <div class="flex items-start gap-2">
                             <span class="text-yellow-600 mt-0.5">📈</span>
                             <span><strong>1000°C:</strong> Đủ cao để thoát khỏi tối ưu cục bộ</span>
                           </div>
                         </div>
                       </div>
                       
                       <!-- 5 ràng buộc chính -->
                       <div class="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-lg border border-red-200">
                         <div class="flex items-center gap-3 mb-3">
                           <div class="bg-red-200 p-3 rounded-full">
                             <span class="text-2xl font-bold text-red-800">5</span>
                           </div>
                           <div>
                             <div class="font-bold text-red-800">Ràng buộc chính</div>
                             <div class="text-sm text-red-600">Constraint Satisfaction</div>
                           </div>
                         </div>
                         <div class="space-y-2 text-sm text-gray-700">
                           <div class="flex items-start gap-2">
                             <span class="text-red-600 mt-0.5">1️⃣</span>
                             <span><strong>Cân bằng điểm:</strong> Ưu tiên team có điểm thấp</span>
                           </div>
                           <div class="flex items-start gap-2">
                             <span class="text-red-600 mt-0.5">2️⃣</span>
                             <span><strong>Khoảng mục tiêu:</strong> Tự động tính từ dữ liệu thực tế</span>
                           </div>
                           <div class="flex items-start gap-2">
                             <span class="text-red-600 mt-0.5">3️⃣</span>
                             <span><strong>Cân bằng loại:</strong> A, B, C phân bổ đều</span>
                           </div>
                           <div class="flex items-start gap-2">
                             <span class="text-red-600 mt-0.5">4️⃣</span>
                             <span><strong>Tránh trùng lặp:</strong> Không quá nhiều cùng loại</span>
                           </div>
                           <div class="flex items-start gap-2">
                             <span class="text-red-600 mt-0.5">5️⃣</span>
                             <span><strong>Cân bằng số lượng:</strong> Mỗi team đúng 4 người</span>
                           </div>
                         </div>
                       </div>
                     </div>
                     
                     <!-- Tính toán động -->
                     <div class="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                       <h5 class="font-bold text-green-800 mb-3 flex items-center gap-2">
                         <span>📊</span>
                         <span>Tính Toán Khoảng Điểm Động</span>
                       </h5>
                       <div class="text-sm text-green-700 space-y-2">
                         <div class="flex items-start gap-2">
                           <span class="text-green-600 mt-0.5">1️⃣</span>
                           <span><strong>Tính điểm trung bình:</strong> Tổng điểm tất cả người chơi ÷ số người</span>
                         </div>
                         <div class="flex items-start gap-2">
                           <span class="text-green-600 mt-0.5">2️⃣</span>
                           <span><strong>Nhân với 4:</strong> Điểm mục tiêu cho mỗi team (4 người/team)</span>
                         </div>
                         <div class="flex items-start gap-2">
                           <span class="text-green-600 mt-0.5">3️⃣</span>
                           <span><strong>±15% dao động:</strong> Cho phép chênh lệch hợp lý giữa các team</span>
                         </div>
                         <div class="flex items-start gap-2">
                           <span class="text-green-600 mt-0.5">💡</span>
                           <span><strong>Ví dụ:</strong> Nếu điểm TB = 12 → Mục tiêu = 48 → Khoảng = 41-55 điểm</span>
                         </div>
                       </div>
                     </div>
                     
                     <!-- Tại sao chọn thuật toán này -->
                     <div class="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                       <h5 class="font-bold text-purple-800 mb-3 flex items-center gap-2">
                         <span>🤔</span>
                         <span>Tại sao chọn thuật toán này?</span>
                       </h5>
                       <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                         <div class="space-y-2">
                           <div class="flex items-start gap-2">
                             <span class="text-purple-600 mt-0.5">⚡</span>
                             <span><strong>Nhanh:</strong> 15,000 lần thử thay vì 10^15 cách</span>
                           </div>
                           <div class="flex items-start gap-2">
                             <span class="text-purple-600 mt-0.5">🎯</span>
                             <span><strong>Chính xác:</strong> Tìm được giải pháp gần tối ưu</span>
                           </div>
                           <div class="flex items-start gap-2">
                             <span class="text-purple-600 mt-0.5">🔄</span>
                             <span><strong>Linh hoạt:</strong> Dễ điều chỉnh tham số</span>
                           </div>
                         </div>
                         <div class="space-y-2">
                           <div class="flex items-start gap-2">
                             <span class="text-purple-600 mt-0.5">🏆</span>
                             <span><strong>Công bằng:</strong> Đảm bảo trận đấu AOE cân bằng</span>
                           </div>
                           <div class="flex items-start gap-2">
                             <span class="text-purple-600 mt-0.5">🧠</span>
                             <span><strong>Thông minh:</strong> Tự động tính khoảng điểm từ dữ liệu thực tế</span>
                           </div>
                           <div class="flex items-start gap-2">
                             <span class="text-purple-600 mt-0.5">📈</span>
                             <span><strong>Mở rộng:</strong> Áp dụng cho số người chơi khác</span>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                   
                   <!-- Nguyên tắc hoạt động -->
                   <div class="bg-white rounded-lg p-5 mb-5 border-2 border-purple-100">
                     <h4 class="text-lg font-bold text-purple-700 mb-4 flex items-center gap-2">
                       <span>🎯</span>
                       <span>Nguyên Tắc Hoạt Động</span>
                     </h4>
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div class="space-y-3">
                         <div class="flex items-start gap-3">
                           <div class="bg-blue-100 p-2 rounded-full">
                             <span class="text-blue-600 font-bold">1</span>
                           </div>
                           <div>
                             <div class="font-semibold text-gray-800">Cặp người cao nhất + thấp nhất</div>
                             <div class="text-sm text-gray-600">Đảm bảo mỗi team có ít nhất 1 cặp cân bằng</div>
                           </div>
                         </div>
                         <div class="flex items-start gap-3">
                           <div class="bg-green-100 p-2 rounded-full">
                             <span class="text-green-600 font-bold">2</span>
                           </div>
                           <div>
                             <div class="font-semibold text-gray-800">Phân bổ đều loại người chơi</div>
                             <div class="text-sm text-gray-600">A, B, C được chia cân bằng giữa các team</div>
                           </div>
                         </div>
                         <div class="flex items-start gap-3">
                           <div class="bg-yellow-100 p-2 rounded-full">
                             <span class="text-yellow-600 font-bold">3</span>
                           </div>
                           <div>
                             <div class="font-semibold text-gray-800">Khoảng điểm động</div>
                             <div class="text-sm text-gray-600">Tự động tính từ điểm trung bình thực tế ±15%</div>
                           </div>
                         </div>
                       </div>
                       <div class="space-y-3">
                         <div class="flex items-start gap-3">
                           <div class="bg-purple-100 p-2 rounded-full">
                             <span class="text-purple-600 font-bold">4</span>
                           </div>
                           <div>
                             <div class="font-semibold text-gray-800">Thuật toán nung kim loại</div>
                             <div class="text-sm text-gray-600">Tìm kiếm toàn cục, tránh tối ưu cục bộ</div>
                           </div>
                         </div>
                         <div class="flex items-start gap-3">
                           <div class="bg-red-100 p-2 rounded-full">
                             <span class="text-red-600 font-bold">5</span>
                           </div>
                           <div>
                             <div class="font-semibold text-gray-800">Đánh giá đa tiêu chí</div>
                             <div class="text-sm text-gray-600">Độ lệch chuẩn, chênh lệch max, phân bổ loại</div>
                           </div>
                         </div>
                         <div class="flex items-start gap-3">
                           <div class="bg-indigo-100 p-2 rounded-full">
                             <span class="text-indigo-600 font-bold">6</span>
                           </div>
                           <div>
                             <div class="font-semibold text-gray-800">Dừng sớm khi tối ưu</div>
                             <div class="text-sm text-gray-600">Tiết kiệm thời gian khi tìm được kết quả tốt</div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                   
                   <!-- Ví dụ thực tế -->
                   <div class="bg-white rounded-lg p-5 border-2 border-purple-100">
                     <h4 class="text-lg font-bold text-purple-700 mb-4 flex items-center gap-2">
                       <span>📝</span>
                       <span>Ví Dụ Cân Bằng Thực Tế</span>
                     </h4>
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div class="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                         <h5 class="font-bold text-red-800 mb-3 flex items-center gap-2">
                           <span>🏛️</span>
                           <span>Team A (Cân bằng tốt)</span>
                         </h5>
                         <div class="space-y-2 text-sm">
                           <div class="flex justify-between items-center">
                             <span class="font-medium">Trụ Cột:</span>
                             <span class="bg-red-100 px-2 py-1 rounded text-red-800 font-semibold">22 điểm</span>
                           </div>
                           <div class="flex justify-between items-center">
                             <span class="font-medium">Trung Bình:</span>
                             <span class="bg-yellow-100 px-2 py-1 rounded text-yellow-800 font-semibold">12, 14 điểm</span>
                           </div>
                           <div class="flex justify-between items-center">
                             <span class="font-medium">Hỗ Trợ:</span>
                             <span class="bg-green-100 px-2 py-1 rounded text-green-800 font-semibold">3, 5 điểm</span>
                           </div>
                           <div class="flex justify-between items-center pt-2 border-t border-red-200 font-bold text-red-800">
                             <span>Tổng:</span>
                             <span class="text-lg">56 điểm</span>
                           </div>
                         </div>
                       </div>
                       
                       <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                         <h5 class="font-bold text-blue-800 mb-3 flex items-center gap-2">
                           <span>🏛️</span>
                           <span>Team B (Cân bằng tốt)</span>
                         </h5>
                         <div class="space-y-2 text-sm">
                           <div class="flex justify-between items-center">
                             <span class="font-medium">Trụ Cột:</span>
                             <span class="bg-red-100 px-2 py-1 rounded text-red-800 font-semibold">25 điểm</span>
                           </div>
                           <div class="flex justify-between items-center">
                             <span class="font-medium">Trung Bình:</span>
                             <span class="bg-yellow-100 px-2 py-1 rounded text-yellow-800 font-semibold">8, 10 điểm</span>
                           </div>
                           <div class="flex justify-between items-center">
                             <span class="font-medium">Hỗ Trợ:</span>
                             <span class="bg-green-100 px-2 py-1 rounded text-green-800 font-semibold">2, 4 điểm</span>
                           </div>
                           <div class="flex justify-between items-center pt-2 border-t border-blue-200 font-bold text-blue-800">
                             <span>Tổng:</span>
                             <span class="text-lg">49 điểm</span>
                           </div>
                         </div>
                       </div>
                     </div>
                     <div class="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                       <div class="flex items-start gap-3">
                         <span class="text-2xl">💡</span>
                         <div>
                           <div class="font-semibold text-yellow-800 mb-1">Kết quả cân bằng:</div>
                           <div class="text-sm text-yellow-700">
                             Chênh lệch chỉ 7 điểm (56 vs 49), cả hai team đều có cấu trúc cân bằng với 1 trụ cột mạnh, 
                             2 trung bình và 1 hỗ trợ. Thuật toán đảm bảo không có team quá mạnh hay quá yếu.
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 </div> <!-- Đóng div cho nội dung có thể thu gọn -->
               </div>
             </header>
      
      <main>
        <!-- Tab Navigation -->
        <div class="mb-8">
          <div class="flex flex-wrap justify-center gap-1 bg-gray-100 p-1 rounded-lg max-w-5xl mx-auto">
            <button
              @click="switchToTab('teams')"
              :class="[
                'px-4 py-3 rounded-md font-medium transition-colors',
                activeTab === 'teams' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              ]"
            >
              🎰 Chia Team Cân Bằng Ngẫu Nhiên
            </button>
            <button
              @click="switchToTab('eight')"
              :class="[
                'px-4 py-3 rounded-md font-medium transition-colors',
                activeTab === 'eight'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              ]"
            >
              🎯 Chọn 8 người chia 4v4
            </button>
            <button
              @click="switchToTab('twos')"
              :class="[
                'px-4 py-3 rounded-md font-medium transition-colors',
                activeTab === 'twos'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              ]"
            >
              ⚔️ Chọn danh sách chia 2v2
            </button>
            <button
              @click="switchToTab('threes')"
              :class="[
                'px-4 py-3 rounded-md font-medium transition-colors',
                activeTab === 'threes'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              ]"
            >
              🛡️ Chọn danh sách chia 3v3
            </button>
            <button
              @click="switchToTab('compare')"
              :class="[
                'px-4 py-3 rounded-md font-medium transition-colors',
                activeTab === 'compare'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              ]"
            >
              ⚖️ So sánh 2 đội
            </button>
            <button
              @click="switchToTab('players')"
              :class="[
                'px-4 py-3 rounded-md font-medium transition-colors',
                activeTab === 'players' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              ]"
            >
              👥 Nhập Danh Sách Người Chơi
            </button>
          </div>
        </div>


               <!-- Thông báo khi không phải admin -->
               <div v-if="!isAdmin && activeTab !== 'eight' && activeTab !== 'twos' && activeTab !== 'threes' && activeTab !== 'compare'" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                 <div class="text-yellow-700 text-sm">
                   <span class="font-semibold">⚠️ Chế độ xem chỉ đọc:</span> 
                   Bạn đang xem dữ liệu ở chế độ chỉ đọc. Để thực hiện các thao tác thay đổi dữ liệu, vui lòng đăng nhập với tài khoản admin.
                 </div>
               </div>

        <!-- Tab Content -->
        <div v-if="activeTab === 'teams'" class="space-y-8">
          <!-- Team Balancer và Results -->
          <TeamBalancer 
            v-if="rankedPlayers.length >= 4 && rankedPlayers.length % 4 === 0" 
            :key="regenerateKey"
            :players="rankedPlayers"
            :existing-teams="teams"
            :is-admin="isAdmin"
            @teams-generated="handleTeamsGenerated"
            @require-admin="handleRequireAdmin"
          />
                 <TeamResults v-if="teams.length > 0" :teams="teams" :grade-bands="rosterScale.bands" :is-admin="isAdmin" @regenerate="handleRegenerate" @require-admin="handleRequireAdmin" />
          
          <!-- Thông báo nếu chưa có đủ người chơi -->
          <div v-if="rankedPlayers.length < 4" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div class="text-yellow-600 text-lg font-semibold mb-2">
              ⚠️ Chưa đủ người chơi để chia team
            </div>
            <p class="text-yellow-700 mb-4">
              Hiện tại có {{ rankedPlayers.length }} người chơi đã có điểm. Chia ngẫu nhiên cả danh sách cần ít nhất 4 người, mỗi đội 4 người.
            </p>
            <button
              @click="switchToTab('players')"
              class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              👥 Chuyển đến nhập danh sách
            </button>
          </div>
          
          <!-- Thông báo nếu số người chơi không chia hết cho 4 -->
          <div v-else-if="rankedPlayers.length % 4 !== 0" class="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
            <div class="text-orange-600 text-lg font-semibold mb-2">
              Chia ngẫu nhiên cả danh sách cần số người chia hết cho 4
            </div>
            <p class="text-orange-700 mb-4">
              Hiện có {{ rankedPlayers.length }} người đã có điểm. Tab này xếp mọi người thành các đội 4 người. Danh sách 2v2 và 3v3 vẫn dùng được: vào tab tương ứng rồi chọn đúng số người.
            </p>
            <button
              @click="switchToTab('players')"
              class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              👥 Chuyển đến nhập danh sách
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'compare'" class="space-y-8">
          <TeamCompare
            v-if="namedPlayers.length >= 4"
            :players="namedPlayers"
          />
          <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div class="text-yellow-600 text-lg font-semibold mb-2">
              Chưa đủ người để so sánh
            </div>
            <p class="text-yellow-700 mb-4">
              Hiện có {{ namedPlayers.length }} người. Cần ít nhất 4 người để so một trận 2v2.
            </p>
            <button
              @click="switchToTab('players')"
              class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Chuyển đến nhập danh sách
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'threes'" class="space-y-8">
          <ThreeVsThreeBalancer
            v-if="namedPlayers.length >= 6"
            :players="namedPlayers"
            @rank-change="updatePlayerRank"
          />
          <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div class="text-yellow-600 text-lg font-semibold mb-2">
              Chưa đủ người để chia 3v3
            </div>
            <p class="text-yellow-700 mb-4">
              Hiện có {{ namedPlayers.length }} người. Cần ít nhất 6 người trong danh sách.
            </p>
            <button
              @click="switchToTab('players')"
              class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Chuyển đến nhập danh sách
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'twos'" class="space-y-8">
          <TwoVsTwoBalancer
            v-if="namedPlayers.length >= 4"
            :players="namedPlayers"
            @rank-change="updatePlayerRank"
          />
          <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div class="text-yellow-600 text-lg font-semibold mb-2">
              Chưa đủ người để chia 2v2
            </div>
            <p class="text-yellow-700 mb-4">
              Hiện có {{ namedPlayers.length }} người. Cần ít nhất 4 người trong danh sách.
            </p>
            <button
              @click="switchToTab('players')"
              class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Chuyển đến nhập danh sách
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'eight'" class="space-y-8">
          <EightPlayerBalancer
            v-if="namedPlayers.length >= 8"
            :players="namedPlayers"
            :preset-names="lobbyPlayerNames"
            @rank-change="updatePlayerRank"
          />
          <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div class="text-yellow-600 text-lg font-semibold mb-2">
              Chưa đủ 8 người có điểm để chọn
            </div>
            <p class="text-yellow-700 mb-4">
              Hiện có {{ namedPlayers.length }} người trong danh sách. Cần ít nhất 8 người.
            </p>
            <button
              @click="switchToTab('players')"
              class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Chuyển đến nhập danh sách
            </button>
          </div>
        </div>

               <div v-if="activeTab === 'players'" class="space-y-8">
                 <!-- Player Input với đầy đủ chức năng sửa/xóa -->
                 <PlayerInput
                   :existing-players="players"
                   :is-admin="isAdmin"
                   @players-submitted="handlePlayersInput"
                   @players-updated="handlePlayersUpdate"
                   @require-admin="handleRequireAdmin"
                 />
          
          <!-- Thông báo khi đã có đủ người chơi -->
          <div v-if="players.length > 0" class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div class="text-green-600 text-lg font-semibold mb-2">
              ✅ Đã có {{ players.length }} người chơi
            </div>
            <p class="text-green-700 mb-4">
              Danh sách dùng chung cho mọi kiểu chia. 2v2 chọn số người chia hết cho 4, 3v3 chọn số người chia hết cho 6, 4v4 chọn đúng 8 người. Chia ngẫu nhiên cả danh sách thành đội 4 người khi số người có điểm chia hết cho 4.
            </p>
            <div class="flex flex-wrap justify-center gap-2">
              <button
                v-if="rankedPlayers.length >= 6"
                @click="switchToTab('threes')"
                class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Chia 3v3
              </button>
              <button
                v-if="rankedPlayers.length >= 4 && rankedPlayers.length % 4 === 0"
                @click="switchToTab('teams')"
                class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Chia ngẫu nhiên cả danh sách
              </button>
            </div>
          </div>
               </div>
             </main>
           </div>
         </div>

         <!-- Admin Login Modal -->
         <div v-if="loginEnabled && showLoginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div class="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
             <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">
               🔐 Đăng nhập Admin
             </h3>
             <div class="space-y-4">
               <div>
                 <label class="block text-sm font-medium text-gray-700 mb-2">
                   Mật khẩu Admin
                 </label>
                 <input
                   v-model="loginPassword"
                   type="password"
                   placeholder="Nhập mật khẩu..."
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   @keyup.enter="handleAdminLogin"
                 />
               </div>
               <div v-if="loginError" class="text-red-600 text-sm text-center">
                 {{ loginError }}
               </div>
               <div class="flex space-x-3">
                 <button
                   @click="handleAdminLogin"
                   class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                 >
                   Đăng nhập
                 </button>
                 <button
                   @click="showLoginModal = false; loginPassword = ''; loginError = ''"
                   class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                 >
                   Hủy
                 </button>
               </div>
             </div>
           </div>
         </div>
       </template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { gradeScale, countByGrade } from '../utils/playerGrade.js'

// Add Tailwind CSS and Open Graph meta tags
useHead({
  title: 'AOE Team Balancer - Chia Team Cân Bằng',
  meta: [
    { name: 'description', content: 'Công cụ chia team cân bằng ngẫu nhiên cho Age of Empires với thuật toán tiên tiến. Tạo teams công bằng và thú vị cho game AOE.' },
    { name: 'keywords', content: 'AOE, Age of Empires, chia team, team balancer, game, esports' },
    
    // Open Graph / Facebook
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://aoe-three.vercel.app/' },
    { property: 'og:title', content: '🎮 AOE Team Balancer - Chia Team Cân Bằng' },
    { property: 'og:description', content: 'Công cụ chia team cân bằng ngẫu nhiên cho Age of Empires với thuật toán tiên tiến. Tạo teams công bằng và thú vị!' },
    { property: 'og:image', content: 'https://aoe-three.vercel.app/og-image.png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:site_name', content: 'AOE Team Balancer' },
    
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: 'https://aoe-three.vercel.app/' },
    { name: 'twitter:title', content: '🎮 AOE Team Balancer - Chia Team Cân Bằng' },
    { name: 'twitter:description', content: 'Công cụ chia team cân bằng ngẫu nhiên cho Age of Empires với thuật toán tiên tiến. Tạo teams công bằng và thú vị!' },
    { name: 'twitter:image', content: 'https://aoe-three.vercel.app/og-image.png' },
    
    // Additional meta
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#3B82F6' },
    
    // Zalo specific
    { property: 'og:image:type', content: 'image/png' },
    { property: 'og:image:alt', content: 'AOE Team Balancer - Chia Team Cân Bằng' },
    { name: 'robots', content: 'index, follow' }
  ],
  script: [
    {
      src: 'https://cdn.tailwindcss.com'
    }
  ]
})

const lobbyPlayerNames = [
  'nnn6789',
  'ThinhBM',
  '1DanXayDeChe',
  'GT_SonBay_HaNoi',
  'anhloix4',
  'Ut_Pham_XinhDep',
  'chemthue199x',
  'Fioruna'
]

const players = ref([])
const teams = ref([])
const namedPlayers = computed(() => players.value.filter(player => player && player.name))
const rankedPlayers = computed(() => namedPlayers.value.filter(player => player.rank))
const rosterScale = computed(() => gradeScale(rankedPlayers.value))
const regenerateKey = ref(0)
const activeTab = ref('teams') // Mặc định là tab "Chia Team"
const isInitialLoad = ref(true) // Flag để kiểm tra lần load đầu tiên
const showScoringSystem = ref(false) // Flag để thu gọn phần Hệ Thống Chấm Điểm

// Tạm tắt đăng nhập: đổi thành true khi muốn bật lại mật khẩu admin
const loginEnabled = false
const isAdmin = ref(!loginEnabled)
const showLoginModal = ref(false)
const loginPassword = ref('')
const loginError = ref('')

// Load data from localStorage on mount
onMounted(() => {
  if (process.client) {
    if (loginEnabled) {
      const adminStatus = localStorage.getItem('aoe_admin')
      isAdmin.value = adminStatus === 'true'
    }

    const savedPlayers = localStorage.getItem('aoe_players')
    const savedTeams = localStorage.getItem('aoe_teams')

    if (savedPlayers) {
      try {
        players.value = JSON.parse(savedPlayers)
      } catch (e) {
        console.error('Error loading players:', e)
      }
    }

    players.value = mergeLobbyPlayers(players.value)

    if (savedTeams) {
      try {
        teams.value = JSON.parse(savedTeams)
      } catch (e) {
        console.error('Error loading teams:', e)
      }
    }
    
    // Chỉ chuyển tab khi load lần đầu và thực sự cần thiết
    if (players.value.length === 0) {
      activeTab.value = 'players'
    }
    
    // Đánh dấu đã hoàn thành load ban đầu
    isInitialLoad.value = false
  }
})

// Save players to localStorage whenever it changes
watch(players, (newPlayers) => {
  if (process.client && newPlayers.length > 0) {
    localStorage.setItem('aoe_players', JSON.stringify(newPlayers))
  }
}, { deep: true })

// Save teams to localStorage whenever it changes
watch(teams, (newTeams) => {
  if (process.client && newTeams.length > 0) {
    localStorage.setItem('aoe_teams', JSON.stringify(newTeams))
  }
}, { deep: true })

// Bỏ watcher tự động chuyển tab để tránh xung đột
// Người dùng sẽ tự chuyển tab khi cần thiết

const handlePlayersInput = (inputPlayers) => {
  if (!requireAdmin('thay đổi danh sách người chơi')) return
  players.value = inputPlayers
  teams.value = []
}

const handlePlayersUpdate = (updatedPlayers) => {
  if (!requireAdmin('cập nhật danh sách người chơi')) return
  players.value = updatedPlayers
  teams.value = []
}

const updatePlayerRank = ({ name, rank }) => {
  const index = players.value.findIndex(player => player && player.name === name)
  if (index < 0) return
  players.value[index] = { ...players.value[index], rank }
}

const handleTeamsGenerated = (generatedTeams) => {
  teams.value = generatedTeams
}

const handleRegenerate = () => {
  if (!requireAdmin('chia lại team')) return
  // Clear teams and increment key to force component re-render
  teams.value = []
  // Save empty teams to localStorage
  if (process.client) {
    localStorage.setItem('aoe_teams', JSON.stringify([]))
  }
  regenerateKey.value++
}

const switchToTab = (tabName) => {
  activeTab.value = tabName
  if (tabName === 'eight' || tabName === 'twos' || tabName === 'threes' || tabName === 'compare') {
    showLoginModal.value = false
  }
}

const resetTabLogic = () => {
  // Reset tab logic based on current data
  if (players.value.length === 0) {
    activeTab.value = 'players'
  } else {
    activeTab.value = 'teams'
  }
  isInitialLoad.value = false
}

// Toggle functions
const toggleScoringSystem = () => {
  showScoringSystem.value = !showScoringSystem.value
}

// Import admin config
import { ADMIN_CONFIG } from '../../config/admin.js'

// Admin authentication functions
const handleAdminLogin = () => {
  
  if (loginPassword.value === ADMIN_CONFIG.PASSWORD) {
    isAdmin.value = true
    showLoginModal.value = false
    loginPassword.value = ''
    loginError.value = ''
    
    // Save admin status to localStorage
    if (process.client) {
      localStorage.setItem('aoe_admin', 'true')
    }
    
  } else {
    loginError.value = 'Mật khẩu không đúng!'
  }
}

const handleAdminLogout = () => {
  isAdmin.value = false
  showLoginModal.value = false
  loginPassword.value = ''
  loginError.value = ''
  
  // Remove admin status from localStorage
  if (process.client) {
    localStorage.removeItem('aoe_admin')
  }
  
}

const mergeLobbyPlayers = (list) => {
  const merged = Array.isArray(list) ? [...list] : []
  const existing = new Set(merged.map(player => (player?.name || '').trim().toLowerCase()))
  for (const name of lobbyPlayerNames) {
    if (!existing.has(name.toLowerCase())) {
      merged.push({ name, rank: null })
    }
  }
  return merged
}

const requireAdmin = (action) => {
  if (!loginEnabled) return true
  if (!isAdmin.value) {
    showLoginModal.value = true
    return false
  }
  return true
}

const handleRequireAdmin = (action) => {
  if (!loginEnabled) return
  showLoginModal.value = true
}

// Hàm tính điểm trung bình
const getAveragePoints = () => {
  const validPlayers = players.value.filter(p => p.rank)
  if (validPlayers.length === 0) return 0
  const total = validPlayers.reduce((sum, player) => sum + player.rank, 0)
  return total / validPlayers.length
}

// Hàm tính tổng điểm
const getTotalPoints = () => {
  return players.value.filter(p => p.rank).reduce((sum, player) => sum + player.rank, 0)
}
</script>
