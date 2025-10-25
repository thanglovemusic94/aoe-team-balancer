<template>
  <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold text-gray-800">
        ✏️ Nhập Danh Sách Người Chơi
      </h2>
      <div v-if="!isAdmin" class="text-sm text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
        🔒 Chế độ chỉ đọc
      </div>
    </div>
    
    <!-- Thông báo khi có dữ liệu sẵn -->
    <div v-if="props.existingPlayers && props.existingPlayers.length > 0" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="text-blue-700 text-sm">
        <span class="font-semibold">📋 Đã tải dữ liệu có sẵn:</span> 
        {{ props.existingPlayers.length }} người chơi. Bạn có thể chỉnh sửa trực tiếp trong bảng bên dưới.
      </div>
    </div>
    

    <!-- Thông báo khi chưa có người chơi -->
    <div v-if="players.length === 0" class="mb-4 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
      <div class="text-gray-600 text-lg font-semibold mb-2">
        📝 Chưa có người chơi nào
      </div>
      <p class="text-gray-500 mb-4">
        Hãy thêm người chơi bằng cách click các nút bên dưới hoặc import từ file JSON.
      </p>
      <div class="flex justify-center space-x-2">
        <button
          @click="addMorePlayers(4)"
          class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          ➕ Thêm 4 người
        </button>
        <button
          @click="importFromJSON"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          📥 Import JSON
        </button>
      </div>
    </div>
    
    <div v-else class="overflow-x-auto">
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
          <tr v-for="(player, index) in players" :key="`player-${index}-${players.length}`" class="hover:bg-gray-50">
            <td class="border border-gray-300 px-3 py-2 text-center text-sm">{{ index + 1 }}</td>
            <td class="border border-gray-300 px-2 py-1">
              <input
                v-model="player.name"
                type="text"
                placeholder="Nhập tên..."
                :disabled="!isAdmin"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'bg-gray-100 cursor-not-allowed': !isAdmin }"
              />
            </td>
            <td class="border border-gray-300 px-2 py-1">
              <input
                v-model.number="player.rank"
                type="number"
                min="1"
                placeholder="Nhập điểm..."
                :disabled="!isAdmin"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'bg-gray-100 cursor-not-allowed': !isAdmin }"
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
                  :disabled="!isAdmin"
                  class="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
                  :class="{ 'opacity-50 cursor-not-allowed': !isAdmin }"
                  title="Xóa người chơi này"
                >
                  🗑️
                </button>
                <button
                  v-if="!player.name || !player.rank"
                  @click="fillRandomPlayer(index)"
                  :disabled="!isAdmin"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
                  :class="{ 'opacity-50 cursor-not-allowed': !isAdmin }"
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
          <div class="text-lg font-bold text-blue-600">{{ playerCount }} người</div>
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

    <div class="mt-4 space-y-3">
      <!-- Nút xác nhận và tạo ngẫu nhiên -->
      <div class="flex justify-between items-center">
        <div class="flex space-x-2">
          <button
            @click="addPlayers"
            :disabled="!isAdmin"
            class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            :class="{ 'opacity-50 cursor-not-allowed': !isAdmin }"
          >
            ✅ Xác Nhận ({{ playerCount }} người)
          </button>
        </div>
        <button
          @click="clearAll"
          :disabled="!isAdmin"
          class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          :class="{ 'opacity-50 cursor-not-allowed': !isAdmin }"
        >
          🗑️ Xóa Tất Cả
        </button>
      </div>

      <!-- Nút thêm người chơi và sắp xếp -->
      <div class="flex flex-wrap gap-2 items-center">
        <span class="text-sm font-medium text-gray-700">Thêm người chơi:</span>
        <button
          @click="addMorePlayers(4)"
          :disabled="!isAdmin"
          class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
          :class="{ 'opacity-50 cursor-not-allowed': !isAdmin }"
        >
          ➕ Thêm 4 người
        </button>
        <button
          @click="addMorePlayers(8)"
          :disabled="!isAdmin"
          class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
          :class="{ 'opacity-50 cursor-not-allowed': !isAdmin }"
        >
          ➕ Thêm 8 người
        </button>
        <button
          @click="addMorePlayers(16)"
          :disabled="!isAdmin"
          class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
          :class="{ 'opacity-50 cursor-not-allowed': !isAdmin }"
        >
          ➕ Thêm 16 người
        </button>
        <button
          @click="sortPlayersByRank"
          :disabled="!isAdmin"
          class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
          :class="{ 'opacity-50 cursor-not-allowed': !isAdmin }"
        >
          🔄 Sắp xếp theo điểm
        </button>
        <span class="text-sm text-gray-600 ml-2">(Tổng: {{ players.length }} ô)</span>
      </div>

      <!-- Nút Export/Import -->
      <div class="flex flex-wrap gap-2 items-center">
        <span class="text-sm font-medium text-gray-700">Dữ liệu:</span>
        <button
          @click="exportToJSON"
          :disabled="!isAdmin"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
          :class="{ 'opacity-50 cursor-not-allowed': !isAdmin }"
        >
          📤 Export JSON
        </button>
        <button
          @click="importFromJSON"
          :disabled="!isAdmin"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
          :class="{ 'opacity-50 cursor-not-allowed': !isAdmin }"
        >
          📥 Import JSON
        </button>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          @change="handleFileImport"
          class="hidden"
        />
      </div>
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
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  existingPlayers: {
    type: Array,
    default: () => []
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['players-submitted', 'players-updated', 'require-admin'])

const players = ref([])
const error = ref('')
const success = ref('')
const fileInput = ref(null)

// Check if admin is required for action
const requireAdminForAction = (action) => {
  if (!props.isAdmin) {
    emit('require-admin', action)
    return false
  }
  return true
}

// Initialize players array (empty by default)
const initializePlayers = () => {
  players.value = []
  // Không tạo sẵn 28 ô trống, chỉ tạo khi cần thiết
}

// Add more players (4, 8, 16, etc.)
const addMorePlayers = async (count = 4) => {
  if (!requireAdminForAction('thêm người chơi')) return
  
  
  // Create new array to force reactivity
  const newPlayers = [...players.value]
  for (let i = 0; i < count; i++) {
    newPlayers.push({ name: '', rank: null })
  }
  
  players.value = newPlayers
  
  // Wait for DOM to update
  await nextTick()
  
  success.value = `✅ Đã thêm ${count} ô trống mới! Tổng: ${players.value.length} ô`
  error.value = ''
  
  // Don't emit when just adding empty slots - only emit when players have actual data
}

// Sort players by rank (high to low)
const sortPlayersByRank = () => {
  if (!requireAdminForAction('sắp xếp danh sách')) return
  
  players.value = [...players.value].sort((a, b) => {
    // If both have rank, sort by rank (high to low)
    if (a.rank && b.rank) {
      return b.rank - a.rank
    }
    // If only one has rank, player with rank comes first
    if (a.rank && !b.rank) return -1
    if (!a.rank && b.rank) return 1
    // If both don't have rank, keep original order
    return 0
  })
  success.value = '🔄 Đã sắp xếp danh sách theo điểm từ cao xuống thấp!'
}

// Export data to JSON
const exportToJSON = () => {
  const validPlayers = players.value.filter(p => p.name && p.rank)
  
  if (validPlayers.length === 0) {
    error.value = 'Không có dữ liệu để export!'
    return
  }

  const dataToExport = {
    players: validPlayers,
    exportDate: new Date().toISOString(),
    totalPlayers: validPlayers.length,
    teamCount: Math.floor(validPlayers.length / 4)
  }

  const jsonString = JSON.stringify(dataToExport, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `aoe-players-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  success.value = `📤 Đã export ${validPlayers.length} người chơi ra file JSON!`
  error.value = ''
}

// Import data from JSON
const importFromJSON = () => {
  fileInput.value.click()
}

// Handle file import
const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      
      if (!data.players || !Array.isArray(data.players)) {
        throw new Error('File JSON không hợp lệ!')
      }

      // Validate players data
      const validPlayers = data.players.filter(p => p.name && p.rank && 
        typeof p.name === 'string' && 
        typeof p.rank === 'number' && 
        p.rank >= 1 && p.rank <= 23)

      if (validPlayers.length === 0) {
        throw new Error('Không có dữ liệu người chơi hợp lệ!')
      }

      // Clear current data and load new data
      players.value = validPlayers
      
      // Emit update
      emit('players-updated', validPlayers)
      
      success.value = `📥 Đã import ${validPlayers.length} người chơi từ file JSON!`
      error.value = ''
      
      
    } catch (err) {
      error.value = `Lỗi import file: ${err.message}`
      success.value = ''
    }
  }
  
  reader.readAsText(file)
  
  // Reset file input
  event.target.value = ''
}

// Load existing players if available
onMounted(() => {
  if (props.existingPlayers && props.existingPlayers.length > 0) {
    // Load existing players
    players.value = [...props.existingPlayers]
  } else {
    initializePlayers()
  }
})

// Watch for changes in existingPlayers prop (only on mount, not during updates)
watch(() => props.existingPlayers, (newPlayers) => {
  if (newPlayers && newPlayers.length > 0) {
    // Only update if we don't have any players yet (initial load)
    if (players.value.length === 0) {
      players.value = [...newPlayers]
    }
  }
}, { deep: true, immediate: false })

// Remove automatic watcher to prevent recursive updates
// We'll emit manually when needed

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
  return players.value.filter(p => p.name && p.rank).length
})

const clearAll = () => {
  if (!requireAdminForAction('xóa tất cả dữ liệu')) return
  
  players.value = []
  error.value = ''
  success.value = ''
}


// Xóa người chơi tại vị trí index (xóa hẳn hàng)
const deletePlayer = (index) => {
  if (!requireAdminForAction('xóa người chơi')) return
  
  const player = players.value[index]
  if (confirm(`Bạn có chắc muốn xóa người chơi "${player.name}"?`)) {
    // Xóa hẳn phần tử khỏi mảng
    players.value.splice(index, 1)
    success.value = `🗑️ Đã xóa người chơi "${player.name}"`
    
    // Emit update manually
    const validPlayers = players.value.filter(p => p.name && p.rank)
    emit('players-updated', validPlayers)
  }
}

// Tạo ngẫu nhiên cho 1 người chơi
const fillRandomPlayer = (index) => {
  if (!requireAdminForAction('tạo người chơi ngẫu nhiên')) return
  
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
  
  players.value[index] = { name, rank }
  success.value = `🎲 Đã tạo ngẫu nhiên "${name}" với ${rank} điểm`
  
  // Emit update manually
  const validPlayers = players.value.filter(p => p.name && p.rank)
  emit('players-updated', validPlayers)
}

// Lấy class cho badge category
const getRankBadgeClass = (rank) => {
  if (!rank) return 'bg-gray-100 text-gray-700 border border-gray-300'
  if (rank >= 17) return 'bg-red-100 text-red-700 border border-red-300'
  if (rank >= 7) return 'bg-yellow-100 text-yellow-700 border border-yellow-300'
  if (rank >= 1) return 'bg-green-100 text-green-700 border border-green-300'
  return 'bg-gray-100 text-gray-700 border border-gray-300'
}

// Lấy category của rank
const getRankCategory = (rank) => {
  if (!rank) return 'N/A'
  if (rank >= 17) return 'Trụ Cột'
  if (rank >= 7) return 'Trung Bình'
  if (rank >= 1) return 'Hỗ Trợ'
  return 'N/A'
}

// Đếm số lượng người chơi theo category
const getCategoryCount = (category) => {
  return players.value.filter(player => {
    if (!player.rank) return false
    switch (category) {
      case 'A': return player.rank >= 17
      case 'B': return player.rank >= 7 && player.rank < 17
      case 'C': return player.rank >= 1 && player.rank < 7
      default: return false
    }
  }).length
}

const addPlayers = () => {
  if (!requireAdminForAction('xác nhận danh sách người chơi')) return
  
  error.value = ''
  success.value = ''
  
  // Filter out empty players
  const validPlayers = players.value.filter(p => p.name && p.rank)
  
  // Check minimum count (phải có ít nhất 4 người để chia team)
  if (validPlayers.length < 4) {
    error.value = `Vui lòng nhập ít nhất 4 người chơi để chia team. Hiện tại: ${validPlayers.length} người.`
    return
  }
  
  // Check if count is divisible by 4 (mỗi team có 4 người)
  if (validPlayers.length % 4 !== 0) {
    error.value = `Số người chơi phải chia hết cho 4 (mỗi team có 4 người). Hiện tại: ${validPlayers.length} người.`
    return
  }
  
  // Validate rank range (chỉ check min, không giới hạn max)
  const invalidRank = validPlayers.find(p => p.rank < 1)
  if (invalidRank) {
    error.value = `Điểm số phải lớn hơn hoặc bằng 1.`
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
  
  const teamCount = Math.floor(formattedPlayers.length / 4)
  success.value = `✅ Đã xác nhận ${formattedPlayers.length} người chơi (chia thành ${teamCount} teams)!`
  emit('players-submitted', formattedPlayers)
}
</script>
