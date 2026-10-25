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
          <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
            <span v-for="item in gradeSummary(team.players, gradeBands)" :key="item.id">{{ item.label }}: {{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Nút chia lại -->
    <div class="mt-8 text-center">
      <div v-if="!isAdmin" class="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
        <div class="flex items-center justify-center gap-2 mb-2">
          <span class="text-2xl">🔒</span>
          <p class="text-sm font-semibold text-yellow-800">
            Yêu cầu đăng nhập Admin
          </p>
        </div>
        <p class="text-sm text-gray-700 mb-3">
          Chỉ admin mới có thể quay random lại các đội. Vui lòng đăng nhập để sử dụng chức năng này.
        </p>
        <button 
          @click="() => emit('require-admin', 'quay random ' + teams.length + ' đội cân bằng')"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md"
        >
          🔐 Đăng nhập Admin
        </button>
      </div>
      
      <button
        @click="handleRegenerate"
        :disabled="!isAdmin"
        class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:hover:scale-100 disabled:shadow-none"
      >
        🎲 Quay Random {{ teams.length }} Đội Cân Bằng
      </button>
      <p v-if="isAdmin" class="mt-2 text-xs text-gray-500">
        Click để tạo lại {{ teams.length }} đội ngẫu nhiên với thuật toán cân bằng tiên tiến
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { gradeScale, gradeForScore, gradeSummary } from '../utils/playerGrade.js'

const props = defineProps({
  teams: {
    type: Array,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  gradeBands: {
    type: Array,
    default: () => []
  }
})

const gradeBands = computed(() => (
  props.gradeBands.length
    ? props.gradeBands
    : gradeScale(props.teams.flatMap(team => team.players || [])).bands
))

const emit = defineEmits(['regenerate', 'require-admin'])

const handleRegenerate = () => {
  if (!props.isAdmin) {
    emit('require-admin', 'chia lại team')
    return
  }
  emit('regenerate')
}

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

const getPlayerRankClass = (rank) => gradeForScore(rank, gradeBands.value)?.badgeClass || 'bg-gray-100 text-gray-700 border border-gray-300'

const getRankBadgeClass = (rank) => getPlayerRankClass(rank)

const getRankCategory = (rank) => gradeForScore(rank, gradeBands.value)?.label || 'N/A'

// Sắp xếp players trong team: Trụ Cột → Trung Bình → Hỗ Trợ
const getSortedPlayersForTeam = (players) => {
  return [...players].sort((a, b) => {
    // Trụ Cột (14-17) = 3
    // Trung Bình (8-13) = 2
    // Hỗ Trợ (1-7) = 1
    const getCategory = (rank) => {
      if (rank >= 14) return 3 // Trụ Cột: 14-17 điểm
      if (rank >= 8) return 2  // Trung Bình: 8-13 điểm
      return 1                 // Hỗ Trợ: 1-7 điểm
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
