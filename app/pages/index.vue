<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          🎮 AOE Team Balancer
        </h1>
        <p class="text-lg text-gray-600">
          Công cụ chia team cân bằng ngẫu nhiên cho Age of Empires
        </p>
      </header>
      
      <main>
        <!-- Tab Navigation -->
        <div class="mb-8">
          <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mx-auto">
            <button
              @click="switchToTab('teams')"
              :class="[
                'px-6 py-3 rounded-md font-medium transition-colors',
                activeTab === 'teams' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              ]"
            >
              🎰 Chia Team Cân Bằng Ngẫu Nhiên
            </button>
            <button
              @click="switchToTab('players')"
              :class="[
                'px-6 py-3 rounded-md font-medium transition-colors',
                activeTab === 'players' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              ]"
            >
              👥 Nhập Danh Sách Người Chơi
            </button>
          </div>
        </div>

        <!-- Debug Info -->
        <div class="mb-4 p-2 bg-gray-100 rounded text-xs text-gray-600 flex justify-between items-center">
          <span>Debug: activeTab = {{ activeTab }}, players.length = {{ players.length }}, isInitialLoad = {{ isInitialLoad }}</span>
          <button 
            @click="resetTabLogic"
            class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
          >
            Reset Tab Logic
          </button>
        </div>

        <!-- Tab Content -->
        <div v-if="activeTab === 'teams'" class="space-y-8">
          <!-- Team Balancer và Results -->
          <TeamBalancer 
            v-if="players.length === 28" 
            :key="regenerateKey"
            :players="players"
            :existing-teams="teams"
            @teams-generated="handleTeamsGenerated"
          />
          <TeamResults v-if="teams.length > 0" :teams="teams" @regenerate="handleRegenerate" />
          
          <!-- Thông báo nếu chưa có đủ 28 người chơi -->
          <div v-if="players.length < 28" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div class="text-yellow-600 text-lg font-semibold mb-2">
              ⚠️ Chưa đủ người chơi để chia team
            </div>
            <p class="text-yellow-700 mb-4">
              Hiện tại có {{ players.length }}/28 người chơi. Vui lòng chuyển sang tab "Nhập Danh Sách Người Chơi" để thêm đủ 28 người.
            </p>
            <button
              @click="switchToTab('players')"
              class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              👥 Chuyển đến nhập danh sách
            </button>
          </div>
        </div>

        <div v-if="activeTab === 'players'" class="space-y-8">
          <!-- Player Input với đầy đủ chức năng sửa/xóa -->
          <PlayerInput 
            :existing-players="players" 
            @players-submitted="handlePlayersInput"
            @players-updated="handlePlayersUpdate"
          />
          
          <!-- Thông báo khi đã có đủ 28 người -->
          <div v-if="players.length === 28" class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div class="text-green-600 text-lg font-semibold mb-2">
              ✅ Đã có đủ 28 người chơi!
            </div>
            <p class="text-green-700 mb-4">
              Bạn có thể chuyển sang tab "Chia Team Cân Bằng Ngẫu Nhiên" để bắt đầu chia team.
            </p>
            <button
              @click="switchToTab('teams')"
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              🎰 Chuyển đến chia team
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// Add Tailwind CSS
useHead({
  title: 'AOE Team Balancer',
  script: [
    {
      src: 'https://cdn.tailwindcss.com'
    }
  ]
})

const players = ref([])
const teams = ref([])
const regenerateKey = ref(0)
const activeTab = ref('teams') // Mặc định là tab "Chia Team"
const isInitialLoad = ref(true) // Flag để kiểm tra lần load đầu tiên

// Load data from localStorage on mount
onMounted(() => {
  if (process.client) {
    const savedPlayers = localStorage.getItem('aoe_players')
    const savedTeams = localStorage.getItem('aoe_teams')
    
    if (savedPlayers) {
      try {
        players.value = JSON.parse(savedPlayers)
        console.log('✅ Loaded players from localStorage')
      } catch (e) {
        console.error('Error loading players:', e)
      }
    }
    
    if (savedTeams) {
      try {
        teams.value = JSON.parse(savedTeams)
        console.log('✅ Loaded teams from localStorage')
      } catch (e) {
        console.error('Error loading teams:', e)
      }
    }
    
    // Chỉ chuyển tab khi load lần đầu và thực sự cần thiết
    if (players.value.length === 0) {
      activeTab.value = 'players' // Nếu chưa có người chơi, chuyển sang tab nhập
      console.log('🔄 Chuyển sang tab nhập vì chưa có người chơi')
    } else if (players.value.length < 28) {
      activeTab.value = 'players' // Nếu chưa đủ 28 người, chuyển sang tab nhập
      console.log('🔄 Chuyển sang tab nhập vì chưa đủ 28 người chơi')
    }
    // Nếu đã có đủ 28 người, giữ tab mặc định (teams)
    // Không tự động chuyển để tránh xung đột
    
    // Đánh dấu đã hoàn thành load ban đầu
    isInitialLoad.value = false
  }
})

// Save players to localStorage whenever it changes
watch(players, (newPlayers) => {
  if (process.client && newPlayers.length > 0) {
    localStorage.setItem('aoe_players', JSON.stringify(newPlayers))
    console.log('💾 Saved players to localStorage')
  }
}, { deep: true })

// Save teams to localStorage whenever it changes
watch(teams, (newTeams) => {
  if (process.client && newTeams.length > 0) {
    localStorage.setItem('aoe_teams', JSON.stringify(newTeams))
    console.log('💾 Saved teams to localStorage')
  }
}, { deep: true })

// Bỏ watcher tự động chuyển tab để tránh xung đột
// Người dùng sẽ tự chuyển tab khi cần thiết

const handlePlayersInput = (inputPlayers) => {
  players.value = inputPlayers
  teams.value = []
}

const handlePlayersUpdate = (updatedPlayers) => {
  players.value = updatedPlayers
  teams.value = []
}

const handleTeamsGenerated = (generatedTeams) => {
  teams.value = generatedTeams
}

const handleRegenerate = () => {
  // Clear teams and increment key to force component re-render
  teams.value = []
  // Save empty teams to localStorage
  if (process.client) {
    localStorage.setItem('aoe_teams', JSON.stringify([]))
    console.log('🗑️ Cleared teams in localStorage')
  }
  regenerateKey.value++
}

const switchToTab = (tabName) => {
  console.log(`🔄 Switching to tab: ${tabName}`)
  activeTab.value = tabName
}

const resetTabLogic = () => {
  // Reset tab logic based on current data
  if (players.value.length === 0) {
    activeTab.value = 'players'
  } else if (players.value.length < 28) {
    activeTab.value = 'players'
  } else {
    activeTab.value = 'teams'
  }
  isInitialLoad.value = false
  console.log('🔄 Reset tab logic - activeTab:', activeTab.value)
}
</script>
