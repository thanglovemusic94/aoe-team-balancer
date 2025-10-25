<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">
      🏆 Kết Quả Chia Team
    </h2>
    
    <!-- Thống kê tổng quan -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-blue-50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ teams.length }}</div>
        <div class="text-sm text-gray-600">Số Team</div>
      </div>
      <div class="bg-green-50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-green-600">{{ averagePoints.toFixed(1) }}</div>
        <div class="text-sm text-gray-600">Điểm TB/Team</div>
      </div>
      <div class="bg-purple-50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-purple-600">{{ minDifference }}</div>
        <div class="text-sm text-gray-600">Chênh Lệch Min</div>
      </div>
      <div class="bg-yellow-50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-yellow-600">{{ maxDifference }}</div>
        <div class="text-sm text-gray-600">Chênh Lệch Max</div>
      </div>
    </div>
    
    <!-- Danh sách các team -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div 
        v-for="team in sortedTeams" 
        :key="team.id"
        class="border-2 rounded-lg p-4"
        :class="getTeamBorderClass(team.totalPoints)"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-800">{{ team.name }}</h3>
          <div class="text-right">
            <div class="text-2xl font-bold" :class="getTeamPointsClass(team.totalPoints)">
              {{ team.totalPoints }}
            </div>
            <div class="text-sm text-gray-600">điểm</div>
          </div>
        </div>
        
        <div class="space-y-2">
          <div 
            v-for="(player, index) in getSortedPlayersForTeam(team.players)" 
            :key="index"
            class="flex justify-between items-center p-2 bg-gray-50 rounded"
          >
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-800">{{ player.name }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="getRankBadgeClass(player.rank)">
                {{ getRankCategory(player.rank) }}
              </span>
            </div>
            <span 
              class="px-2 py-1 rounded text-sm font-semibold"
              :class="getPlayerRankClass(player.rank)"
            >
              {{ player.rank }}
            </span>
          </div>
        </div>
        
        <!-- Phân loại thành viên -->
        <div class="mt-4 pt-3 border-t border-gray-200">
          <div class="flex justify-between text-xs text-gray-600">
            <span>Trụ cột: {{ getPlayersByCategory(team.players, 'A').length }}</span>
            <span>Trung bình: {{ getPlayersByCategory(team.players, 'B').length }}</span>
            <span>Hỗ trợ: {{ getPlayersByCategory(team.players, 'C').length }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Nút chia lại -->
    <div class="mt-8 text-center">
      <button
        @click="$emit('regenerate')"
        class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        🔄 Chia Lại Team
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  teams: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['regenerate'])

const sortedTeams = computed(() => {
  return [...props.teams].sort((a, b) => a.id - b.id) // Sắp xếp theo ID từ nhỏ đến lớn
})

const averagePoints = computed(() => {
  const total = props.teams.reduce((sum, team) => sum + team.totalPoints, 0)
  return total / props.teams.length
})

const maxDifference = computed(() => {
  const points = props.teams.map(team => team.totalPoints)
  return Math.max(...points) - Math.min(...points)
})

const minDifference = computed(() => {
  const points = props.teams.map(team => team.totalPoints)
  // Tính chênh lệch nhỏ nhất giữa 2 team bất kỳ (không phải chênh lệch min so với max)
  const sortedPoints = [...points].sort((a, b) => a - b)
  
  // Tìm chênh lệch nhỏ nhất giữa các team liền kề
  let minDiff = Infinity
  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const diff = sortedPoints[i + 1] - sortedPoints[i]
    if (diff < minDiff && diff > 0) {
      minDiff = diff
    }
  }
  
  return minDiff === Infinity ? 0 : minDiff
})

const getTeamBorderClass = (points) => {
  if (points >= 44 && points <= 46) return 'border-green-400 bg-green-50'
  if (points >= 42 && points <= 43) return 'border-blue-400 bg-blue-50'
  if (points >= 40 && points <= 41) return 'border-yellow-400 bg-yellow-50'
  return 'border-red-400 bg-red-50'
}

const getTeamPointsClass = (points) => {
  if (points >= 44 && points <= 46) return 'text-green-600'
  if (points >= 42 && points <= 43) return 'text-blue-600'
  if (points >= 40 && points <= 41) return 'text-yellow-600'
  return 'text-red-600'
}

const getPlayerRankClass = (rank) => {
  if (rank >= 17) return 'bg-red-100 text-red-700'
  if (rank >= 7) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

const getRankBadgeClass = (rank) => {
  if (rank >= 17 && rank <= 23) return 'bg-red-100 text-red-700 border border-red-300'
  if (rank >= 7 && rank <= 16) return 'bg-yellow-100 text-yellow-700 border border-yellow-300'
  if (rank >= 1 && rank <= 6) return 'bg-green-100 text-green-700 border border-green-300'
  return 'bg-gray-100 text-gray-700 border border-gray-300'
}

const getRankCategory = (rank) => {
  if (rank >= 17 && rank <= 23) return 'Trụ Cột'
  if (rank >= 7 && rank <= 16) return 'Trung Bình'
  if (rank >= 1 && rank <= 6) return 'Hỗ Trợ'
  return 'N/A'
}

const getPlayersByCategory = (players, category) => {
  switch (category) {
    case 'A':
      return players.filter(p => p.rank >= 17)
    case 'B':
      return players.filter(p => p.rank >= 7 && p.rank <= 16)
    case 'C':
      return players.filter(p => p.rank <= 6)
    default:
      return []
  }
}

// Sắp xếp players trong team: Trụ Cột → Trung Bình → Hỗ Trợ
const getSortedPlayersForTeam = (players) => {
  return [...players].sort((a, b) => {
    // Trụ Cột (17-23) = 3
    // Trung Bình (7-16) = 2
    // Hỗ Trợ (1-6) = 1
    const getCategory = (rank) => {
      if (rank >= 17) return 3
      if (rank >= 7) return 2
      return 1
    }
    
    const categoryA = getCategory(a.rank)
    const categoryB = getCategory(b.rank)
    
    // Sắp xếp theo category (từ cao xuống thấp), sau đó theo rank (từ cao xuống thấp)
    if (categoryA !== categoryB) {
      return categoryB - categoryA // Trụ Cột trước, Hỗ Trợ sau
    }
    return b.rank - a.rank // Trong cùng category, rank cao trước
  })
}
</script>
