<template>
  <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">
      👥 Danh Sách Người Chơi
    </h2>
    
    <div class="mb-4 flex justify-between items-center">
      <span class="text-lg font-medium text-gray-700">
        Tổng: {{ players.length }} người chơi
      </span>
      <span class="text-lg font-medium text-blue-600">
        Tổng điểm: {{ totalPoints }}
      </span>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div 
        v-for="(player, index) in sortedPlayers" 
        :key="index"
        class="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300 relative"
      >
        <div class="flex justify-between items-center mb-2">
          <div class="flex-1">
            <span 
              v-if="!editingPlayer || editingPlayer !== player"
              class="font-semibold text-gray-800 block"
            >{{ player.name }}</span>
            <input
              v-else
              v-model="editingPlayer.name"
              type="text"
              class="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none"
              @blur="finishEdit"
              @keyup.enter="finishEdit"
            />
          </div>
          <span class="text-lg font-bold ml-2 text-gray-800">
            <input
              v-if="editingPlayer === player"
              :value="editingPlayer.rank ?? ''"
              type="number"
              min="1"
              max="23"
              step="0.5"
              class="w-16 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none"
              @input="editingPlayer.rank = $event.target.value"
              @blur="finishEdit"
              @keyup.enter="finishEdit"
            />
            <span v-else>{{ player.rank }}</span>
          </span>
        </div>
        
        <div class="flex gap-2 mt-2">
          <button
            @click="editPlayer(player)"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ✏️ Sửa
          </button>
          <button
            @click="deletePlayer(player)"
            class="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            🗑️ Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { normalizeScore } from '../utils/playerGrade.js'

const props = defineProps({
  players: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update-players'])

const editingPlayer = ref(null)

const sortedPlayers = computed(() => {
  return [...props.players]
})

const totalPoints = computed(() => {
  return props.players.reduce((sum, player) => sum + player.rank, 0)
})

const editPlayer = (player) => {
  editingPlayer.value = player
}

const finishEdit = () => {
  if (editingPlayer.value) {
    // Validate the edited data
    const rank = normalizeScore(editingPlayer.value.rank)
    if (rank == null || rank < 1 || rank > 23) {
      alert('Điểm số phải trong khoảng 1-23, có thể là số lẻ như 8.5')
      return
    }
    editingPlayer.value.rank = rank
    if (!editingPlayer.value.name.trim()) {
      alert('Tên không được để trống')
      return
    }
    
    editingPlayer.value = null
  }
}

const deletePlayer = (player) => {
  if (confirm(`Bạn có chắc muốn xóa ${player.name}?`)) {
    const index = props.players.indexOf(player)
    if (index > -1) {
      const newPlayers = [...props.players]
      newPlayers.splice(index, 1)
      emit('update-players', newPlayers)
    }
  }
}
</script>
