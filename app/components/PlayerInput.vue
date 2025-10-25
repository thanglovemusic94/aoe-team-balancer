<template>
  <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">
      ✏️ Nhập Danh Sách Người Chơi
    </h2>
    
    <!-- Thông báo khi có dữ liệu sẵn -->
    <div v-if="props.existingPlayers && props.existingPlayers.length > 0" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="text-blue-700 text-sm">
        <span class="font-semibold">📋 Đã tải dữ liệu có sẵn:</span> 
        {{ props.existingPlayers.length }} người chơi. Bạn có thể chỉnh sửa trực tiếp trong bảng bên dưới.
      </div>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full border-collapse bg-white rounded-lg shadow-sm">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">#</th>
            <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Tên Game</th>
            <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Điểm</th>
            <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Loại</th>
            <th class="border border-gray-300 px-3 py-2 text-center text-sm font-semibold">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(player, index) in sortedPlayers" :key="index" class="hover:bg-gray-50">
            <td class="border border-gray-300 px-3 py-2 text-center text-sm">{{ index + 1 }}</td>
            <td class="border border-gray-300 px-2 py-1">
              <input
                v-model="player.name"
                type="text"
                placeholder="Nhập tên..."
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </td>
            <td class="border border-gray-300 px-2 py-1">
              <input
                v-model.number="player.rank"
                type="number"
                min="1"
                max="23"
                placeholder="Điểm (1-23)"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </td>
            <td class="border border-gray-300 px-2 py-1 text-center">
              <span 
                v-if="player.rank" 
                class="text-xs px-2 py-1 rounded-full inline-block"
                :class="getRankBadgeClass(player.rank)"
              >
                {{ getRankCategory(player.rank) }}
              </span>
              <span v-else class="text-gray-400 text-xs">-</span>
            </td>
            <td class="border border-gray-300 px-2 py-1 text-center">
              <div class="flex justify-center space-x-1">
                <button
                  v-if="player.name && player.rank"
                  @click="deletePlayer(index)"
                  class="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
                  title="Xóa người chơi này"
                >
                  🗑️
                </button>
                <button
                  v-if="!player.name || !player.rank"
                  @click="fillRandomPlayer(index)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
                  title="Tạo ngẫu nhiên"
                >
                  🎲
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Thống kê -->
    <div v-if="playerCount > 0" class="mt-4 p-4 bg-gray-50 rounded-lg">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div class="text-center">
          <div class="font-semibold text-gray-700">Tổng người chơi</div>
          <div class="text-lg font-bold text-blue-600">{{ playerCount }}/28</div>
        </div>
        <div class="text-center">
          <div class="font-semibold text-gray-700">Trụ Cột (A)</div>
          <div class="text-lg font-bold text-red-600">{{ getCategoryCount('A') }}</div>
        </div>
        <div class="text-center">
          <div class="font-semibold text-gray-700">Trung Bình (B)</div>
          <div class="text-lg font-bold text-yellow-600">{{ getCategoryCount('B') }}</div>
        </div>
        <div class="text-center">
          <div class="font-semibold text-gray-700">Hỗ Trợ (C)</div>
          <div class="text-lg font-bold text-green-600">{{ getCategoryCount('C') }}</div>
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-between items-center">
      <div class="flex space-x-2">
        <button
          @click="addPlayers"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          ✅ Xác Nhận ({{ playerCount }}/28)
        </button>
        <button
          @click="generateRandomPlayers"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          🎲 Tạo Danh Sách Ngẫu Nhiên
        </button>
      </div>
      <button
        @click="clearAll"
        class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        🗑️ Xóa Tất Cả
      </button>
    </div>
    
    <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>
    
    <div v-if="success" class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      {{ success }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  existingPlayers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['players-submitted', 'players-updated'])

const players = ref([])
const error = ref('')
const success = ref('')

// Initialize players array
const initializePlayers = () => {
  players.value = []
  for (let i = 0; i < 28; i++) {
    players.value.push({ name: '', rank: null })
  }
}

// Load existing players if available
onMounted(() => {
  if (props.existingPlayers && props.existingPlayers.length > 0) {
    // Load existing players and fill remaining slots
    players.value = [...props.existingPlayers]
    while (players.value.length < 28) {
      players.value.push({ name: '', rank: null })
    }
    console.log('✅ Loaded existing players into input form')
  } else {
    initializePlayers()
  }
})

// Watch for changes in existingPlayers prop
watch(() => props.existingPlayers, (newPlayers) => {
  if (newPlayers && newPlayers.length > 0) {
    players.value = [...newPlayers]
    while (players.value.length < 28) {
      players.value.push({ name: '', rank: null })
    }
  }
}, { deep: true })

// Watch for changes in players and emit updates
watch(players, (newPlayers) => {
  const validPlayers = newPlayers.filter(p => p.name && p.rank)
  if (validPlayers.length > 0) {
    emit('players-updated', validPlayers)
  }
}, { deep: true })

// Sắp xếp danh sách người chơi theo điểm từ cao xuống thấp
const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => {
    // Nếu cả hai đều có điểm, sắp xếp theo điểm (cao xuống thấp)
    if (a.rank && b.rank) {
      return b.rank - a.rank
    }
    // Nếu chỉ một người có điểm, người có điểm đứng trước
    if (a.rank && !b.rank) return -1
    if (!a.rank && b.rank) return 1
    // Nếu cả hai đều không có điểm, giữ nguyên thứ tự
    return 0
  })
})

const playerCount = computed(() => {
  return sortedPlayers.value.filter(p => p.name && p.rank).length
})

const clearAll = () => {
  players.value = []
  for (let i = 0; i < 28; i++) {
    players.value.push({ name: '', rank: null })
  }
  error.value = ''
  success.value = ''
}

const generateRandomPlayers = () => {
  error.value = ''
  success.value = ''
  
  // Danh sách tên ngẫu nhiên
  const names = [
    'Liêm', 'Kiếp', 'F88', 'YB 1999', 'Dánh Đông dẹp bắc', 'Pi', 'Trung con', 'Pheo',
    'Thầy Hiệu Trưởng', 'Hoàng Huy', 'Thành Phạm', 'Việt Béo', 'Đinh Xuân Hào', 'Dx Tá',
    'Bảnh', 'Hiệp', 'Bé bom', 'Ngô Bảo Long', 'Tũn', 'Giáp Nguyễn', 'Cụ già', 'Kim Chung',
    'Máy tính tất thắng', 'Lưu Văn Sỹ', 'Phong Lâm', 'Tuấn Tuấn', 'Thang Tony', 'Koi'
  ]
  
  // Tạo 28 người chơi ngẫu nhiên
  const randomPlayers = []
  const usedNames = new Set()
  
  for (let i = 0; i < 28; i++) {
    let name
    do {
      name = names[Math.floor(Math.random() * names.length)]
    } while (usedNames.has(name))
    
    usedNames.add(name)
    
    // Phân bổ điểm theo tỷ lệ: 7 người A (17-23), 10 người B (7-16), 11 người C (1-6)
    let rank
    if (i < 7) {
      // Nhóm A: 17-23 điểm
      rank = Math.floor(Math.random() * 7) + 17
    } else if (i < 17) {
      // Nhóm B: 7-16 điểm
      rank = Math.floor(Math.random() * 10) + 7
    } else {
      // Nhóm C: 1-6 điểm
      rank = Math.floor(Math.random() * 6) + 1
    }
    
    randomPlayers.push({ name, rank })
  }
  
  // Xáo trộn thứ tự
  for (let i = randomPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomPlayers[i], randomPlayers[j]] = [randomPlayers[j], randomPlayers[i]]
  }
  
  players.value = randomPlayers
  success.value = '🎲 Đã tạo danh sách ngẫu nhiên 28 người chơi!'
}

// Xóa người chơi tại vị trí index (trong sortedPlayers)
const deletePlayer = (index) => {
  const player = sortedPlayers.value[index]
  if (confirm(`Bạn có chắc muốn xóa người chơi "${player.name}"?`)) {
    // Tìm vị trí thực tế trong mảng players gốc
    const realIndex = players.value.findIndex(p => p === player)
    if (realIndex !== -1) {
      players.value[realIndex] = { name: '', rank: null }
      success.value = `🗑️ Đã xóa người chơi "${player.name}"`
      
      // Emit update immediately
      const validPlayers = players.value.filter(p => p.name && p.rank)
      emit('players-updated', validPlayers)
    }
  }
}

// Tạo ngẫu nhiên cho 1 người chơi (trong sortedPlayers)
const fillRandomPlayer = (index) => {
  const player = sortedPlayers.value[index]
  
  const names = [
    'Liêm', 'Kiếp', 'F88', 'YB 1999', 'Dánh Đông dẹp bắc', 'Pi', 'Trung con', 'Pheo',
    'Thầy Hiệu Trưởng', 'Hoàng Huy', 'Thành Phạm', 'Việt Béo', 'Đinh Xuân Hào', 'Dx Tá',
    'Bảnh', 'Hiệp', 'Bé bom', 'Ngô Bảo Long', 'Tũn', 'Giáp Nguyễn', 'Cụ già', 'Kim Chung',
    'Máy tính tất thắng', 'Lưu Văn Sỹ', 'Phong Lâm', 'Tuấn Tuấn', 'Thang Tony', 'Koi'
  ]
  
  // Tìm tên chưa được sử dụng
  const usedNames = players.value.filter(p => p.name).map(p => p.name)
  let name
  do {
    name = names[Math.floor(Math.random() * names.length)]
  } while (usedNames.includes(name))
  
  // Tạo điểm ngẫu nhiên
  const rank = Math.floor(Math.random() * 23) + 1
  
  // Tìm vị trí thực tế trong mảng players gốc
  const realIndex = players.value.findIndex(p => p === player)
  if (realIndex !== -1) {
    players.value[realIndex] = { name, rank }
    success.value = `🎲 Đã tạo ngẫu nhiên "${name}" với ${rank} điểm`
    
    // Emit update immediately
    const validPlayers = players.value.filter(p => p.name && p.rank)
    emit('players-updated', validPlayers)
  }
}

// Lấy class cho badge category
const getRankBadgeClass = (rank) => {
  if (rank >= 17 && rank <= 23) return 'bg-red-100 text-red-700 border border-red-300'
  if (rank >= 7 && rank <= 16) return 'bg-yellow-100 text-yellow-700 border border-yellow-300'
  if (rank >= 1 && rank <= 6) return 'bg-green-100 text-green-700 border border-green-300'
  return 'bg-gray-100 text-gray-700 border border-gray-300'
}

// Lấy category của rank
const getRankCategory = (rank) => {
  if (rank >= 17 && rank <= 23) return 'Trụ Cột'
  if (rank >= 7 && rank <= 16) return 'Trung Bình'
  if (rank >= 1 && rank <= 6) return 'Hỗ Trợ'
  return 'N/A'
}

// Đếm số lượng người chơi theo category
const getCategoryCount = (category) => {
  return sortedPlayers.value.filter(player => {
    if (!player.rank) return false
    switch (category) {
      case 'A': return player.rank >= 17 && player.rank <= 23
      case 'B': return player.rank >= 7 && player.rank <= 16
      case 'C': return player.rank >= 1 && player.rank <= 6
      default: return false
    }
  }).length
}

const addPlayers = () => {
  error.value = ''
  success.value = ''
  
  // Filter out empty players
  const validPlayers = players.value.filter(p => p.name && p.rank)
  
  // Check count
  if (validPlayers.length !== 28) {
    error.value = `Vui lòng nhập đủ 28 người chơi. Hiện tại: ${validPlayers.length} người.`
    return
  }
  
  // Validate rank range
  const invalidRank = validPlayers.find(p => p.rank < 1 || p.rank > 23)
  if (invalidRank) {
    error.value = `Điểm số phải trong khoảng 1-23.`
    return
  }
  
  // Validate duplicate names
  const names = validPlayers.map(p => p.name.trim())
  const uniqueNames = new Set(names)
  if (uniqueNames.size !== names.length) {
    error.value = 'Có tên người chơi bị trùng lặp. Vui lòng kiểm tra lại.'
    return
  }
  
  // Format data
  const formattedPlayers = validPlayers.map(p => ({
    name: p.name.trim(),
    rank: p.rank
  }))
  
  success.value = `✅ Đã xác nhận ${formattedPlayers.length} người chơi!`
  emit('players-submitted', formattedPlayers)
}
</script>
