<template>
  <div class="min-h-screen" style="background-color: #f6f1e7">
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
               <RealmBanner class="mb-8" />
               
               <!-- Hệ thống chấm điểm -->
               <div class="frame-3d bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mb-8 max-w-5xl mx-auto">
                 <!-- Header có thể click để toggle -->
                 <div 
                   @click="toggleScoringSystem"
                   class="p-6 cursor-pointer hover:bg-blue-100 transition-colors rounded-t-xl"
                   :class="{ 'rounded-xl': !showScoringSystem }"
                 >
                   <h2 class="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
                     <span>📊</span>
                     <span>Cách chấm điểm và chia team</span>
                     <span class="text-2xl transition-transform duration-200 ml-4" :class="{ 'rotate-180': showScoringSystem }">
                       ▼
                     </span>
                   </h2>
                 </div>
                 
                 <!-- Nội dung có thể thu gọn -->
                 <div v-show="showScoringSystem" class="px-6 pb-6">
                 
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
                 
                 <div class="mt-2 bg-white rounded-lg p-5 border border-gray-200 text-left text-gray-700">
                   <p class="mb-3">Mỗi người một số điểm. Có thể dùng số lẻ, ví dụ 8.5.</p>
                   <p class="mb-3">Khi chia team, máy so đúng điểm đang có trong danh sách:</p>
                   <ul class="list-disc pl-5 space-y-1">
                     <li>Người điểm cao đi cùng người điểm thấp.</li>
                     <li>Mỗi team một người thuộc nhóm điểm cao. Người khỏe dư vào team đang yếu hơn.</li>
                     <li>Tổng điểm các team giữ sát nhau.</li>
                   </ul>
                   <p class="mt-3 text-sm text-gray-500">Không dùng mốc điểm cố định. Danh sách đổi điểm thì cách ghép cũng đổi.</p>
                 </div>
                 
                 </div> <!-- Đóng div cho nội dung có thể thu gọn -->
               </div>
             </header>
      
      <main>
        <!-- Tab Navigation -->
        <div class="mb-8">
          <div class="frame-3d flex flex-wrap justify-center gap-1 bg-stone-950/80 p-1 rounded-xl max-w-5xl mx-auto">
            <button
              @click="switchToTab('teams')"
              :class="[
                'px-4 py-3 rounded-md font-medium transition-colors',
                activeTab === 'teams' 
                  ? 'bg-amber-800 text-amber-50 shadow' 
                  : 'text-amber-100/80 hover:text-amber-50'
              ]"
            >
              🎰 Chia Team Cân Bằng Ngẫu Nhiên
            </button>
            <button
              @click="switchToTab('eight')"
              :class="[
                'px-4 py-3 rounded-md font-medium transition-colors',
                activeTab === 'eight'
                  ? 'bg-amber-800 text-amber-50 shadow'
                  : 'text-amber-100/80 hover:text-amber-50'
              ]"
            >
              🎯 Chọn 8 người chia 4v4
            </button>
            <button
              @click="switchToTab('twos')"
              :class="[
                'px-4 py-3 rounded-md font-medium transition-colors',
                activeTab === 'twos'
                  ? 'bg-amber-800 text-amber-50 shadow'
                  : 'text-amber-100/80 hover:text-amber-50'
              ]"
            >
              ⚔️ Chọn danh sách chia 2v2
            </button>
            <button
              @click="switchToTab('threes')"
              :class="[
                'px-4 py-3 rounded-md font-medium transition-colors',
                activeTab === 'threes'
                  ? 'bg-amber-800 text-amber-50 shadow'
                  : 'text-amber-100/80 hover:text-amber-50'
              ]"
            >
              🛡️ Chọn danh sách chia 3v3
            </button>
            <button
              @click="switchToTab('compare')"
              :class="[
                'px-4 py-3 rounded-md font-medium transition-colors',
                activeTab === 'compare'
                  ? 'bg-amber-800 text-amber-50 shadow'
                  : 'text-amber-100/80 hover:text-amber-50'
              ]"
            >
              ⚖️ So sánh 2 đội
            </button>
            <button
              @click="switchToTab('players')"
              :class="[
                'px-4 py-3 rounded-md font-medium transition-colors',
                activeTab === 'players' 
                  ? 'bg-amber-800 text-amber-50 shadow' 
                  : 'text-amber-100/80 hover:text-amber-50'
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
                 <TeamResults v-if="teams.length > 0" :teams="teams" :is-admin="isAdmin" @regenerate="handleRegenerate" @require-admin="handleRequireAdmin" />
          
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

        <div v-show="activeTab === 'threes'" class="space-y-8">
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

        <div v-show="activeTab === 'twos'" class="space-y-8">
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

        <div v-show="activeTab === 'eight'" class="space-y-8">
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
              Danh sách dùng chung cho mọi kiểu chia. Điểm có thể là số lẻ 0.5, ví dụ 8.5 hay 9.5. 2v2 chọn số người chia hết cho 4, 3v3 chọn số người chia hết cho 3 và từ 6 người trở lên, 4v4 chọn đúng 8 người. Chia ngẫu nhiên cả danh sách thành đội 4 người khi số người có điểm chia hết cho 4.
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
import { normalizeScore } from '../utils/playerGrade.js'

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
    { name: 'theme-color', content: '#1c140c' },
    
    // Zalo specific
    { property: 'og:image:type', content: 'image/png' },
    { property: 'og:image:alt', content: 'AOE Team Balancer - Chia Team Cân Bằng' },
    { name: 'robots', content: 'index, follow' }
  ],
  link: [
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&display=swap' }
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
  'Fioruna'
]

const players = ref([])
const teams = ref([])
const namedPlayers = computed(() => players.value.filter(player => player && player.name))
const rankedPlayers = computed(() => namedPlayers.value.filter(player => player.rank))
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
  const score = rank == null || rank === '' ? null : normalizeScore(rank)
  players.value[index] = { ...players.value[index], rank: Number.isFinite(score) ? score : null }
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
