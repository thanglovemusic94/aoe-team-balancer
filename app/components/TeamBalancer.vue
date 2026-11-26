<template>
  <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">
      🎰 Chia Team Cân Bằng Ngẫu Nhiên
    </h2>
    
    <div class="mb-6">
      <!-- Thông báo khi không phải admin -->
      <div v-if="!isAdmin" class="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
        <div class="flex items-center justify-center gap-2 mb-2">
          <span class="text-2xl">🔒</span>
          <p class="text-sm font-semibold text-yellow-800">
            Yêu cầu đăng nhập Admin
          </p>
        </div>
        <p class="text-sm text-gray-700 mb-3">
          Chỉ admin mới có thể quay random các đội. Vui lòng đăng nhập để sử dụng chức năng này.
        </p>
        <button 
          @click="() => emit('require-admin', 'quay random ' + Math.floor(players.length / 4) + ' đội cân bằng')"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md"
        >
          🔐 Đăng nhập Admin
        </button>
      </div>
      
      <button
        @click="generateTeams"
        :disabled="isGenerating || !isAdmin"
        class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:hover:scale-100 disabled:shadow-none flex items-center"
      >
        <span v-if="!isGenerating">🎲 Quay Random {{ Math.floor(players.length / 4) }} Đội Cân Bằng</span>
        <span v-else class="flex items-center">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Đang chia team...
        </span>
      </button>
      <p v-if="isAdmin" class="mt-2 text-xs text-gray-500 text-center">
        Click để chia {{ Math.floor(players.length / 4) }} đội theo điểm đang có: người khỏe đi cùng người yếu.
      </p>
    </div>
    
    <div v-if="algorithmSteps.length > 0" class="mb-6">
      <!-- Header có thể click để toggle -->
      <div 
        @click="toggleAlgorithmSteps"
        class="cursor-pointer hover:bg-gray-100 transition-colors rounded-lg p-3 mb-3"
      >
        <h3 class="text-lg font-semibold text-gray-700 flex items-center justify-between">
          <span>🔄 Quá trình chia team:</span>
          <span class="text-lg transition-transform duration-200" :class="{ 'rotate-180': showAlgorithmSteps }">
            ▼
          </span>
        </h3>
      </div>
      
      <!-- Nội dung có thể thu gọn -->
      <div v-show="showAlgorithmSteps" class="space-y-2">
        <div 
          v-for="(step, index) in algorithmSteps" 
          :key="index"
          class="p-3 bg-gray-50 rounded-lg text-sm"
        >
          {{ step }}
        </div>
      </div>
    </div>
    <FortuneWheel
      v-if="wheel"
      :players="wheel.players"
      :teams="wheel.teams"
      :bands="gradeBands"
      @complete="confirmWheel"
      @close="closeWheel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { gradeScale } from '../utils/playerGrade.js'

const props = defineProps({
  players: {
    type: Array,
    required: true
  },
  existingTeams: {
    type: Array,
    default: () => []
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['teams-generated', 'require-admin'])

const isGenerating = ref(false)
const algorithmSteps = ref([])
const showAlgorithmSteps = ref(false) // Flag để thu gọn phần quá trình chia team
const wheel = ref(null)
const pendingTeams = ref(null)
const gradeBands = computed(() => gradeScale(props.players).bands)

// Toggle function cho dropdown
const toggleAlgorithmSteps = () => {
  showAlgorithmSteps.value = !showAlgorithmSteps.value
}

const confirmWheel = () => {
  if (pendingTeams.value) emit('teams-generated', pendingTeams.value)
  pendingTeams.value = null
  wheel.value = null
}

const closeWheel = () => {
  pendingTeams.value = null
  wheel.value = null
}

const snakeTeams = (players) => {
  const teamSize = 4
  const teamCount = Math.floor(players.length / teamSize)
  const shuffled = shuffleArray([...players])
  const sorted = shuffled.sort((a, b) => b.rank - a.rank)
  const usable = sorted.slice(0, teamCount * teamSize)
  const teams = Array.from({ length: teamCount }, (_, index) => ({
    id: index + 1,
    name: `Team ${index + 1}`,
    players: [],
    totalPoints: 0
  }))
  let forward = true
  let cursor = 0
  while (cursor < usable.length) {
    const order = forward
      ? teams.map((_, index) => index)
      : teams.map((_, index) => teamCount - 1 - index)
    for (const teamIndex of order) {
      if (cursor >= usable.length) break
      const player = usable[cursor]
      cursor += 1
      teams[teamIndex].players.push(player)
      teams[teamIndex].totalPoints += Number(player.rank)
    }
    forward = !forward
  }
  teams.forEach(team => {
    team.totalPoints = Math.round(team.totalPoints * 2) / 2
  })
  return teams
}

const generateTeams = async () => {
  if (!props.isAdmin) {
    emit('require-admin', 'quay random ' + Math.floor(props.players.length / 4) + ' đội cân bằng')
    return
  }

  isGenerating.value = true
  algorithmSteps.value = []

  try {
    const ranked = [...props.players].sort((a, b) => b.rank - a.rank)
    const strongest = ranked[0]
    const weakest = ranked[ranked.length - 1]
    const teamCount = Math.floor(props.players.length / 4)
    algorithmSteps.value.push('Đang so điểm của danh sách hiện tại, không dùng mốc cố định.')
    if (strongest && weakest) {
      algorithmSteps.value.push(`Khỏe nhất ${strongest.name} (${strongest.rank}) đi cùng nhóm yếu nhất, yếu nhất là ${weakest.name} (${weakest.rank}).`)
    }
    algorithmSteps.value.push(`Xếp ${teamCount} team, mỗi team 4 người.`)
    await sleep(300)

    const balancedTeams = snakeTeams(props.players)
    const totals = balancedTeams.map(team => team.totalPoints)
    const diff = Math.max(...totals) - Math.min(...totals)
    algorithmSteps.value.push(`Chênh lệch tổng điểm lớn nhất: ${diff} điểm.`)

    pendingTeams.value = balancedTeams
    wheel.value = {
      players: balancedTeams.flatMap(team => team.players),
      teams: balancedTeams.map(team => ({
        id: String(team.id),
        name: team.name,
        players: team.players
      }))
    }
    
  } catch (error) {
    algorithmSteps.value.push(`❌ Lỗi: ${error.message}`)
  } finally {
    isGenerating.value = false
  }
}

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Auto-generate teams when component mounts - CHỈ khi chưa có teams
onMounted(() => {
  // Chỉ generate nếu chưa có teams (length = 0)
  if (props.existingTeams.length === 0) {
    generateTeams()
  } else {
  }
})
</script>
