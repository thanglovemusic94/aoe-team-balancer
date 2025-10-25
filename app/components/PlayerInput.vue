<template>
  <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">
      ✏️ Nhập Danh Sách Người Chơi
    </h2>
    
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">#</th>
            <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Tên Game</th>
            <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Điểm</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(player, index) in players" :key="index">
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
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="mt-4 flex justify-between items-center">
      <button
        @click="addPlayers"
        class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        ✅ Xác Nhận ({{ playerCount }}/28)
      </button>
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
import { ref, computed } from 'vue'

const emit = defineEmits(['players-submitted'])

const players = ref([])
const error = ref('')
const success = ref('')

// Initialize with 28 empty players
for (let i = 0; i < 28; i++) {
  players.value.push({ name: '', rank: null })
}

const playerCount = computed(() => {
  return players.value.filter(p => p.name && p.rank).length
})

const clearAll = () => {
  players.value = []
  for (let i = 0; i < 28; i++) {
    players.value.push({ name: '', rank: null })
  }
  error.value = ''
  success.value = ''
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
