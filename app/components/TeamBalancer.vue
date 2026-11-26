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
        Click để tạo {{ Math.floor(players.length / 4) }} đội ngẫu nhiên với thuật toán cân bằng tiên tiến
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

const generateTeams = async () => {
  if (!props.isAdmin) {
    emit('require-admin', 'quay random ' + Math.floor(props.players.length / 4) + ' đội cân bằng')
    return
  }
  
  isGenerating.value = true
  algorithmSteps.value = []
  
  try {
    // Bước 1: Phân loại người chơi
    algorithmSteps.value.push('🔄 Đang phân loại người chơi...')
    algorithmSteps.value.push('🎯 Mục tiêu: Chênh lệch tối đa 2-3 điểm (chấp nhận)')
    await sleep(500)
    
    const groupA = props.players.filter(p => p.rank >= 14) // Trụ Cột: 14-17 điểm
    const groupB = props.players.filter(p => p.rank >= 8 && p.rank < 14) // Trung Bình: 8-13 điểm
    const groupC = props.players.filter(p => p.rank >= 1 && p.rank < 8) // Hỗ Trợ: 1-7 điểm
    
    algorithmSteps.value.push(`✅ Nhóm A (Trụ Cột): ${groupA.length} người`)
    algorithmSteps.value.push(`✅ Nhóm B (Trung Bình): ${groupB.length} người`)
    algorithmSteps.value.push(`✅ Nhóm C (Hỗ Trợ): ${groupC.length} người`)
    
    // Bước 2: Tìm người cao nhất và thấp nhất trong TẤT CẢ người chơi
    const allPlayers = [...props.players]
    const sortedAllPlayers = allPlayers.sort((a, b) => b.rank - a.rank)
    const globalHighestPlayer = sortedAllPlayers[0] // Người điểm cao nhất
    const globalLowestPlayer = sortedAllPlayers[sortedAllPlayers.length - 1] // Người điểm thấp nhất
    
    algorithmSteps.value.push(`🎯 Người cao nhất: ${globalHighestPlayer.name} (${globalHighestPlayer.rank} điểm)`)
    algorithmSteps.value.push(`🎯 Người thấp nhất: ${globalLowestPlayer.name} (${globalLowestPlayer.rank} điểm)`)
    
    // Bước 3: Tính số team cần tạo
    const totalPlayers = props.players.length
    const teamCount = Math.floor(totalPlayers / 4)
    algorithmSteps.value.push(`📊 Tổng ${totalPlayers} người chơi → Tạo ${teamCount} teams`)
    
    // Bước 4: Xáo trộn nhóm A và gán trụ cột
    algorithmSteps.value.push('🎲 Đang xáo trộn nhóm trụ cột...')
    await sleep(500)
    
    const shuffledGroupA = shuffleArray([...groupA])
    algorithmSteps.value.push(`✅ Đã xáo trộn ${shuffledGroupA.length} trụ cột`)
    
    // Bước 5: Tạo teams với trụ cột
    algorithmSteps.value.push(`🏗️ Đang tạo ${teamCount} team với trụ cột...`)
    await sleep(500)
    
    const teams = []
    for (let i = 0; i < teamCount; i++) {
      const pillarPlayer = shuffledGroupA[i] || null // Có thể không đủ trụ cột
      teams.push({
        id: i + 1,
        name: `Team ${i + 1}`,
        players: pillarPlayer ? [pillarPlayer] : [],
        totalPoints: pillarPlayer ? pillarPlayer.rank : 0
      })
    }
    
    algorithmSteps.value.push(`✅ Đã gán trụ cột cho ${teamCount} team`)
    
    // Bước 6: Phân bổ ngẫu nhiên nhóm B và C
    algorithmSteps.value.push('🎯 Đang phân bổ ngẫu nhiên nhóm B và C...')
    await sleep(500)
    
    // Lấy tất cả người chơi chưa được gán (trừ những người đã gán làm trụ cột)
    const assignedPillars = teams.filter(t => t.players.length > 0).map(t => t.players[0])
    const remainingPlayers = props.players.filter(p => !assignedPillars.some(ap => ap.name === p.name))
    
    algorithmSteps.value.push(`✅ Có ${remainingPlayers.length} người còn lại để phân bổ`)
    
    // Thuật toán cân bằng ngẫu nhiên
    const balancedTeams = await balanceTeamsRandomly(teams, remainingPlayers, globalHighestPlayer, globalLowestPlayer)
    
    algorithmSteps.value.push('🎉 Hoàn thành! Đã chia team cân bằng ngẫu nhiên')

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

const balanceTeamsRandomly = async (teams, remainingPlayers, globalHighestPlayer, globalLowestPlayer) => {
  // Thuật toán cân bằng nâng cao với Simulated Annealing
  
  // Tính toán khoảng điểm mục tiêu từ dữ liệu thực tế
  const allPlayers = [...props.players]
  const avgPlayerPoints = allPlayers.reduce((sum, p) => sum + p.rank, 0) / allPlayers.length
  const targetPerTeam = avgPlayerPoints * 4 // 4 người/team
  const tolerance = 0.15 // 15% dao động cho phép
  const targetRange = { 
    min: Math.floor(targetPerTeam * (1 - tolerance)), 
    max: Math.floor(targetPerTeam * (1 + tolerance)) 
  }
  
  // Log thông tin tính toán
  algorithmSteps.value.push(`📊 Tính toán khoảng điểm mục tiêu:`)
  algorithmSteps.value.push(`   - Điểm trung bình/người: ${avgPlayerPoints.toFixed(1)}`)
  algorithmSteps.value.push(`   - Điểm mục tiêu/team: ${targetPerTeam.toFixed(1)}`)
  algorithmSteps.value.push(`   - Khoảng cho phép: ${targetRange.min}-${targetRange.max} điểm`)
  
  const maxAttempts = 15000 // Tăng số lần thử
  
  let bestSolution = null
  let bestScore = Infinity
  let currentSolution = null
  let currentScore = Infinity
  
  // Sắp xếp remaining players theo rank (cao xuống thấp) để phân bổ từ người mạnh trước
  const sortedPlayers = [...remainingPlayers].sort((a, b) => b.rank - a.rank)
  
  // Simulated Annealing parameters
  const initialTemperature = 1000
  const coolingRate = 0.95
  const minTemperature = 0.1
  let temperature = initialTemperature
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Tạo playersToAssign mới từ sortedPlayers gốc trong mỗi attempt - LUÔN shuffle
    let playersToAssign = shuffleArray([...sortedPlayers])
    
    // Thêm random factor mạnh hơn để tạo kết quả khác nhau
    if (Math.random() < 0.7) {
      // 70% khả năng shuffle lại để tăng tính random
      playersToAssign = shuffleArray(playersToAssign)
    }
    
    // 30% khả năng đảo ngược thứ tự để tăng random
    if (Math.random() < 0.3) {
      playersToAssign = playersToAssign.reverse()
    }
    
    const tempTeams = teams.map(team => ({
      ...team,
      players: [...team.players],
      totalPoints: team.totalPoints
    }))
    
    // QUAN TRỌNG: Luôn cặp người cao nhất (23 điểm) và thấp nhất (1 điểm) trong TẤT CẢ 28 người vào 1 team
    // Tìm team có người 23 điểm và thêm người 1 điểm vào đó - LUÔN LUÔN làm điều này
    let targetTeamForGlobalPair = null
    
    for (const team of tempTeams) {
      if (team.players.some(p => p.name === globalHighestPlayer.name)) {
        targetTeamForGlobalPair = team
        break
      }
    }
    
    // Thêm người 1 điểm vào team có người 23 điểm - BẮT BUỘC trong mọi attempt
    if (targetTeamForGlobalPair && globalLowestPlayer) {
      const lowestPlayerIndex = playersToAssign.findIndex(p => p.name === globalLowestPlayer.name)
      
      // Log để debug
      if (attempt <= 2) {
      }
      
      if (lowestPlayerIndex > -1) {
        targetTeamForGlobalPair.players.push(globalLowestPlayer)
        targetTeamForGlobalPair.totalPoints += globalLowestPlayer.rank
        playersToAssign.splice(lowestPlayerIndex, 1)
        
        // Log để debug
        if (attempt <= 2) {
        }
      } else {
        // Log để debug
        if (attempt <= 2) {
        }
      }
    }
    
    // Phân bổ thông minh với Constraint Satisfaction
    for (const player of playersToAssign) {
      const availableTeams = tempTeams.filter(team => team.players.length < 4)
      
      // Nếu không còn team nào có slot, dừng lại
      if (availableTeams.length === 0) {
        break
      }
      
      // Chọn team tốt nhất dựa trên multiple constraints + thêm randomness
      const targetTeam = selectBestTeamForPlayer(player, availableTeams, tempTeams, targetRange, attempt)
      
      targetTeam.players.push(player)
      targetTeam.totalPoints += player.rank
    }
    
    // Log để debug
    if (attempt === 0) {
      const totalAssigned = tempTeams.reduce((sum, team) => sum + team.players.length, 0)
      tempTeams.forEach((team, i) => {
      })
      
      // Log Team 5 chi tiết để tìm Kiếp
      const team5 = tempTeams.find(t => t.name === 'Team 5')
      if (team5) {
      }
    }
    
    // Tính điểm cân bằng với các yếu tố nâng cao
    const teamPoints = tempTeams.map(team => team.totalPoints)
    const avgPoints = teamPoints.reduce((sum, points) => sum + points, 0) / teamPoints.length
    const variance = teamPoints.reduce((sum, points) => sum + Math.pow(points - avgPoints, 2), 0) / teamPoints.length
    const maxDiff = Math.max(...teamPoints) - Math.min(...teamPoints)
    const standardDeviation = Math.sqrt(variance)
    
    // Kiểm tra xem có trong khoảng mục tiêu không
    const allInRange = teamPoints.every(points => points >= targetRange.min && points <= targetRange.max)
    
    // Tính điểm cân bằng category (A, B, C) trong mỗi team
    const categoryBalanceScore = calculateCategoryBalanceScore(tempTeams)
    
    // Tính điểm cân bằng số lượng người trong mỗi team
    const playerCountBalanceScore = calculatePlayerCountBalanceScore(tempTeams)
    
    // Tính điểm tin cậy (0-100) với các yếu tố mới
    const reliabilityScore = calculateReliabilityScore(teamPoints, maxDiff, standardDeviation, allInRange, categoryBalanceScore, playerCountBalanceScore)
    
    // Tính điểm tổng hợp với weighted factors
    const score = calculateAdvancedScore(
      allInRange, 
      variance, 
      maxDiff, 
      standardDeviation, 
      reliabilityScore, 
      categoryBalanceScore, 
      playerCountBalanceScore
    )
    
    // Simulated Annealing logic
    const shouldAccept = score < currentScore || 
      (temperature > 0 && Math.random() < Math.exp(-(score - currentScore) / temperature))
    
    if (shouldAccept) {
      currentSolution = tempTeams.map(team => ({ ...team }))
      currentScore = score
      
      // Cập nhật best solution nếu tốt hơn
    if (score < bestScore) {
      bestScore = score
      bestSolution = tempTeams.map(team => ({ ...team }))
      
        // Log khi tìm thấy solution tốt hơn
        if (attempt <= 5) {
          const teamWithHighest = tempTeams.find(t => t.players.some(p => p.name === globalHighestPlayer.name))
          const hasKiếp = teamWithHighest && teamWithHighest.players.some(p => p.name === globalLowestPlayer.name)
        }
      }
    }
    
    // Giảm nhiệt độ theo thời gian
    if (attempt % 100 === 0) {
      temperature = Math.max(minTemperature, temperature * coolingRate)
    }
    
     // Early stopping conditions với Simulated Annealing - ƯU TIÊN CHÊNH LỆCH THẤP NHẤT
     if (allInRange && maxDiff <= 1 && standardDeviation < 1.0) {
       algorithmSteps.value.push(`🌟 Tìm thấy giải pháp cân bằng hoàn hảo! (SD: ${standardDeviation.toFixed(2)}, MaxDiff: ${maxDiff})`)
       break
     }
     
     // Dừng sớm nếu chênh lệch rất nhỏ (0-1 điểm)
     if (maxDiff <= 1 && allInRange) {
       algorithmSteps.value.push(`🎯 Tìm thấy giải pháp với chênh lệch tối ưu! (MaxDiff: ${maxDiff})`)
       break
     }
     
     // Dừng sớm nếu chênh lệch ≤ 2 điểm và đã thử đủ lần
     if (attempt > 1000 && allInRange && maxDiff <= 2) {
       algorithmSteps.value.push(`✅ Tìm thấy giải pháp tốt! (MaxDiff: ${maxDiff}) sau ${attempt} lần thử`)
       break
     }
     
     // Dừng sớm nếu chênh lệch ≤ 3 điểm (mặc định) và đã thử đủ lần
     if (attempt > 500 && allInRange && maxDiff <= 3) {
       algorithmSteps.value.push(`✅ Tìm thấy giải pháp với chênh lệch ${maxDiff} điểm (chấp nhận 2-3đ) sau ${attempt} lần thử`)
       break
     }
  }
  
  // Nếu không tìm được giải pháp hoàn hảo, sử dụng giải pháp tốt nhất
  if (!bestSolution) {
    bestSolution = teams.map(team => ({ ...team }))
    // Phân bổ đơn giản với thuật toán greedy
    const sortedRemaining = [...remainingPlayers].sort((a, b) => b.rank - a.rank)
    for (const player of sortedRemaining) {
      const targetTeam = bestSolution.reduce((min, team) => 
        team.totalPoints < min.totalPoints ? team : min
      )
      targetTeam.players.push(player)
      targetTeam.totalPoints += player.rank
    }
    algorithmSteps.value.push('⚠️ Không tìm được giải pháp tối ưu, sử dụng phân bổ greedy')
  } else {
    const finalTeamPoints = bestSolution.map(t => t.totalPoints)
    const finalMaxDiff = Math.max(...finalTeamPoints) - Math.min(...finalTeamPoints)
    
    // Kiểm tra chênh lệch cuối cùng - chỉ chấp nhận 2-3 điểm
    if (finalMaxDiff > 3) {
      algorithmSteps.value.push(`⚠️ Cảnh báo: Chênh lệch ${finalMaxDiff} điểm > 3đ! Thử lại...`)
      
      // Thử lại với random seed khác
      const retryPlayers = shuffleArray([...remainingPlayers])
      return balanceTeamsRandomly(teams, retryPlayers, globalHighestPlayer, globalLowestPlayer)
    }
    
    // Thông báo kết quả chênh lệch
    if (finalMaxDiff <= 2) {
      algorithmSteps.value.push(`🎯 Hoàn hảo! Chênh lệch chỉ ${finalMaxDiff} điểm`)
    } else if (finalMaxDiff === 3) {
      algorithmSteps.value.push(`✅ Tốt! Chênh lệch ${finalMaxDiff} điểm (trong khoảng chấp nhận)`)
    }
    
    const avgFinalPoints = finalTeamPoints.reduce((sum, points) => sum + points, 0) / finalTeamPoints.length
    const finalVariance = finalTeamPoints.reduce((sum, points) => sum + Math.pow(points - avgFinalPoints, 2), 0) / finalTeamPoints.length
    const finalSD = Math.sqrt(finalVariance)
    
    const finalReliability = calculateReliabilityScore(finalTeamPoints, finalMaxDiff, finalSD, true)
    const reliabilityLevel = getReliabilityLevel(finalReliability)
    
    // Debug: Kiểm tra số người trong mỗi team
    const teamPlayerCounts = bestSolution.map(t => t.players.length)
    const totalPlayers = teamPlayerCounts.reduce((sum, count) => sum + count, 0)
    const expectedPlayers = props.players.length
    // Tính các điểm số nâng cao cho logging
    const finalCategoryBalance = calculateCategoryBalanceScore(bestSolution)
    const finalPlayerCountBalance = calculatePlayerCountBalanceScore(bestSolution)
    
    algorithmSteps.value.push(`✅ Đã tìm được giải pháp cân bằng nâng cao`)
    algorithmSteps.value.push(`   - Chênh lệch: ${finalMaxDiff} điểm`)
    algorithmSteps.value.push(`   - Độ lệch chuẩn: ${finalSD.toFixed(2)}`)
    algorithmSteps.value.push(`   - Điểm trung bình: ${avgFinalPoints.toFixed(1)}`)
    algorithmSteps.value.push(`   - Điểm tin cậy: ${finalReliability.toFixed(1)}/100 ${reliabilityLevel}`)
    algorithmSteps.value.push(`   - Cân bằng category: ${finalCategoryBalance.toFixed(1)}/100`)
    algorithmSteps.value.push(`   - Cân bằng số lượng: ${finalPlayerCountBalance.toFixed(1)}/100`)
    algorithmSteps.value.push(`   - Tổng số người trong teams: ${totalPlayers}/${expectedPlayers} (Số người mỗi team: ${teamPlayerCounts.join(', ')})`)
    
    if (totalPlayers !== expectedPlayers) {
      algorithmSteps.value.push(`⚠️ CẢNH BÁO: Tổng số người (${totalPlayers}) khác ${expectedPlayers}!`)
    }
    
    // Log chi tiết để debug
    bestSolution.forEach(team => {
    })
    
    // Kiểm tra Kiếp có trong team có Liêm không
    const teamWithHighest = bestSolution.find(t => t.players.some(p => p.name === globalHighestPlayer.name))
    const hasKiếp = teamWithHighest && teamWithHighest.players.some(p => p.name === globalLowestPlayer.name)
    if (teamWithHighest) {
    }
  }
  
  return bestSolution
}

// Utility functions
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

// Tính điểm cân bằng category (A, B, C) trong mỗi team
const calculateCategoryBalanceScore = (teams) => {
  let totalScore = 0
  
  for (const team of teams) {
    const categoryCounts = {
      A: team.players.filter(p => p.rank >= 17).length, // Trụ Cột
      B: team.players.filter(p => p.rank >= 7 && p.rank <= 16).length, // Trung Bình
      C: team.players.filter(p => p.rank <= 6).length // Hỗ Trợ
    }
    
    // Lý tưởng: mỗi team nên có 1 A, 1-2 B, 1-2 C
    const idealA = 1
    const idealB = 1.5 // Trung bình
    const idealC = 1.5 // Trung bình
    
    const aDiff = Math.abs(categoryCounts.A - idealA)
    const bDiff = Math.abs(categoryCounts.B - idealB)
    const cDiff = Math.abs(categoryCounts.C - idealC)
    
    // Điểm cho team này (0-100, càng cao càng tốt)
    const teamScore = Math.max(0, 100 - (aDiff + bDiff + cDiff) * 20)
    totalScore += teamScore
  }
  
  return totalScore / teams.length // Trung bình của tất cả teams
}

// Tính điểm cân bằng số lượng người trong mỗi team
const calculatePlayerCountBalanceScore = (teams) => {
  const playerCounts = teams.map(team => team.players.length)
  const avgCount = playerCounts.reduce((sum, count) => sum + count, 0) / playerCounts.length
  const countVariance = playerCounts.reduce((sum, count) => sum + Math.pow(count - avgCount, 2), 0) / playerCounts.length
  const countStandardDeviation = Math.sqrt(countVariance)
  
  // Điểm cao nếu tất cả teams có cùng số người (4)
  if (countStandardDeviation === 0) {
    return 100
  }
  
  // Trừ điểm dựa trên độ lệch chuẩn
  return Math.max(0, 100 - countStandardDeviation * 25)
}

// Tính điểm tin cậy nâng cao (0-100)
const calculateReliabilityScore = (teamPoints, maxDiff, standardDeviation, allInRange, categoryBalanceScore, playerCountBalanceScore) => {
  let score = 100
  
  // Trừ điểm nếu không trong khoảng mục tiêu
  if (!allInRange) {
    score -= 30
  }
  
  // Trừ điểm dựa trên chênh lệch điểm
  if (maxDiff <= 1) {
    score += 10 // Bonus cho chênh lệch rất nhỏ
  } else if (maxDiff <= 2) {
    score += 5
  } else if (maxDiff <= 3) {
    // Không trừ
  } else if (maxDiff <= 4) {
    score -= 10
  } else if (maxDiff <= 5) {
    score -= 20
  } else {
    score -= 30
  }
  
  // Trừ điểm dựa trên độ lệch chuẩn
  if (standardDeviation <= 0.5) {
    score += 5 // Bonus cho độ lệch rất thấp
  } else if (standardDeviation <= 1.0) {
    score += 3
  } else if (standardDeviation <= 1.5) {
    // Không trừ
  } else if (standardDeviation <= 2.0) {
    score -= 5
  } else if (standardDeviation <= 2.5) {
    score -= 10
  } else {
    score -= 15
  }
  
  // Thêm điểm dựa trên cân bằng category
  score += categoryBalanceScore * 0.2
  
  // Thêm điểm dựa trên cân bằng số lượng người
  score += playerCountBalanceScore * 0.1
  
  return Math.max(0, Math.min(100, score))
}

// Tính điểm tổng hợp với weighted factors
const calculateAdvancedScore = (allInRange, variance, maxDiff, standardDeviation, reliabilityScore, categoryBalanceScore, playerCountBalanceScore) => {
  // Các trọng số cho từng yếu tố - ƯU TIÊN CHÊNH LỆCH ĐIỂM TỐI ĐA
  const weights = {
    range: 0.15,       // Trong khoảng mục tiêu
    variance: 0.1,     // Phương sai
    maxDiff: 0.5,      // Chênh lệch tối đa - TĂNG TRỌNG SỐ LÊN 50%
    stdDev: 0.1,       // Độ lệch chuẩn
    category: 0.1,     // Cân bằng category
    playerCount: 0.05  // Cân bằng số lượng người
  }
  
  // Tính điểm cho từng yếu tố - ƯU TIÊN CHÊNH LỆCH 2-3 ĐIỂM
  const rangeScore = allInRange ? 0 : 1000 // Penalty lớn nếu không trong khoảng
  const varianceScore = variance * 10
  const maxDiffScore = maxDiff <= 2 ? maxDiff * 10 : maxDiff <= 3 ? maxDiff * 30 : maxDiff * 200 // Ưu tiên 2-3đ
  const stdDevScore = standardDeviation * 15
  const categoryScore = (100 - categoryBalanceScore) * 2
  const playerCountScore = (100 - playerCountBalanceScore) * 1
  
  // Tính điểm tổng hợp
  const totalScore = 
    rangeScore * weights.range +
    varianceScore * weights.variance +
    maxDiffScore * weights.maxDiff +
    stdDevScore * weights.stdDev +
    categoryScore * weights.category +
    playerCountScore * weights.playerCount
  
  // Trừ điểm tin cậy (càng cao càng tốt)
  return totalScore - reliabilityScore * 0.1
}

// Chọn team tốt nhất cho player dựa trên multiple constraints
const selectBestTeamForPlayer = (player, availableTeams, allTeams, targetRange, attempt = 0) => {
  let bestTeam = availableTeams[0]
  let bestScore = -Infinity
  
  // Thêm randomness mạnh hơn để tạo kết quả khác nhau
  const randomFactor = Math.random() * 0.5 + Math.random() * (attempt + 1) * 0.1
  
  for (const team of availableTeams) {
    let score = 0
    
    // Constraint 1: Ưu tiên team có điểm thấp nhất (cân bằng điểm) - TĂNG TRỌNG SỐ
    const currentPoints = team.totalPoints
    const projectedPoints = currentPoints + player.rank
    const avgPoints = allTeams.reduce((sum, t) => sum + t.totalPoints, 0) / allTeams.length
    
    // Điểm càng thấp so với trung bình càng tốt - TĂNG TRỌNG SỐ LÊN 50
    score += (avgPoints - currentPoints) * 50
    
    // Constraint 2: Ưu tiên team trong khoảng mục tiêu sau khi thêm player
    if (projectedPoints >= targetRange.min && projectedPoints <= targetRange.max) {
      score += 50
    } else {
      // Penalty nếu vượt quá khoảng mục tiêu
      const overage = Math.max(0, projectedPoints - targetRange.max)
      const underage = Math.max(0, targetRange.min - projectedPoints)
      score -= (overage + underage) * 5
    }
    
    // Constraint 2.5: Ưu tiên team giúp giảm chênh lệch điểm tối đa
    const allTeamPoints = allTeams.map(t => t === team ? projectedPoints : t.totalPoints)
    const maxPoints = Math.max(...allTeamPoints)
    const minPoints = Math.min(...allTeamPoints)
    const currentMaxDiff = maxPoints - minPoints
    
    // Tính chênh lệch nếu không chọn team này
    const otherTeamPoints = allTeams.filter(t => t !== team).map(t => t.totalPoints)
    const otherMaxPoints = Math.max(...otherTeamPoints)
    const otherMinPoints = Math.min(...otherTeamPoints)
    const otherMaxDiff = otherMaxPoints - otherMinPoints
    
    // Nếu chọn team này giúp giảm chênh lệch, thêm điểm
    if (currentMaxDiff < otherMaxDiff) {
      score += (otherMaxDiff - currentMaxDiff) * 30
    } else {
      score -= (currentMaxDiff - otherMaxDiff) * 20
    }
    
    // Constraint 3: Cân bằng category trong team
    const currentCategoryCounts = getCategoryCounts(team.players)
    const projectedCategoryCounts = getCategoryCounts([...team.players, player])
    
    // Ưu tiên team thiếu category của player này
    const playerCategory = getPlayerCategory(player.rank)
    const currentCount = currentCategoryCounts[playerCategory]
    const idealCount = getIdealCategoryCount(playerCategory)
    
    if (currentCount < idealCount) {
      score += 20 // Bonus nếu team thiếu category này
    }
    
    // Constraint 4: Tránh team có quá nhiều người cùng category
    const projectedCount = projectedCategoryCounts[playerCategory]
    if (projectedCount > idealCount) {
      score -= 15 // Penalty nếu team sẽ có quá nhiều người cùng category
    }
    
    // Constraint 5: Ưu tiên team có ít người hơn (cân bằng số lượng)
    const currentPlayerCount = team.players.length
    const avgPlayerCount = allTeams.reduce((sum, t) => sum + t.players.length, 0) / allTeams.length
    score += (avgPlayerCount - currentPlayerCount) * 5
    
    // Thêm randomness để tạo kết quả khác nhau mỗi lần
    score += randomFactor
    
    if (score > bestScore) {
      bestScore = score
      bestTeam = team
    }
  }
  
  return bestTeam
}

// Lấy số lượng người theo category trong team
const getCategoryCounts = (players) => {
  return {
    A: players.filter(p => p.rank >= 14).length, // Trụ Cột: 14-17 điểm
    B: players.filter(p => p.rank >= 8 && p.rank < 14).length, // Trung Bình: 8-13 điểm
    C: players.filter(p => p.rank >= 1 && p.rank < 8).length // Hỗ Trợ: 1-7 điểm
  }
}

// Lấy category của player
const getPlayerCategory = (rank) => {
  if (rank >= 14) return 'A' // Trụ Cột: 14-17 điểm
  if (rank >= 8) return 'B'  // Trung Bình: 8-13 điểm
  return 'C'                 // Hỗ Trợ: 1-7 điểm
}

// Lấy số lượng lý tưởng cho mỗi category trong team
const getIdealCategoryCount = (category) => {
  switch (category) {
    case 'A': return 1 // Mỗi team nên có 1 trụ cột
    case 'B': return 1.5 // Trung bình 1-2 người trung bình
    case 'C': return 1.5 // Trung bình 1-2 người hỗ trợ
    default: return 1
  }
}

// Xác định mức độ tin cậy
const getReliabilityLevel = (score) => {
  if (score >= 95) return '🌟 Xuất sắc'
  if (score >= 90) return '⭐ Rất tốt'
  if (score >= 85) return '✅ Tốt'
  if (score >= 80) return '👍 Khá tốt'
  if (score >= 75) return '💡 Khá'
  if (score >= 70) return '⚠️ Trung bình'
  if (score >= 60) return '🔶 Có thể chấp nhận'
  return '❌ Cần cải thiện'
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
