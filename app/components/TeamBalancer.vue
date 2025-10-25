<template>
  <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">
      🎰 Chia Team Cân Bằng Ngẫu Nhiên
    </h2>
    
    <div class="mb-6">
      <button
        @click="generateTeams"
        :disabled="isGenerating"
        class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center"
      >
        <span v-if="!isGenerating">🎲 Quay Random 7 Đội Cân Bằng</span>
        <span v-else class="flex items-center">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Đang chia team...
        </span>
      </button>
    </div>
    
    <div v-if="algorithmSteps.length > 0" class="mb-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-3">Quá trình chia team:</h3>
      <div class="space-y-2">
        <div 
          v-for="(step, index) in algorithmSteps" 
          :key="index"
          class="p-3 bg-gray-50 rounded-lg text-sm"
        >
          {{ step }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  players: {
    type: Array,
    required: true
  },
  existingTeams: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['teams-generated'])

const isGenerating = ref(false)
const algorithmSteps = ref([])

const generateTeams = async () => {
  isGenerating.value = true
  algorithmSteps.value = []
  
  try {
    // Bước 1: Phân loại người chơi
    algorithmSteps.value.push('🔄 Đang phân loại người chơi...')
    await sleep(500)
    
    const groupA = props.players.filter(p => p.rank >= 17 && p.rank <= 23) // 7 người
    const groupB = props.players.filter(p => p.rank >= 7 && p.rank <= 16) // 10 người  
    const groupC = props.players.filter(p => p.rank >= 1 && p.rank <= 6) // 11 người
    
    algorithmSteps.value.push(`✅ Nhóm A (Trụ Cột): ${groupA.length} người`)
    algorithmSteps.value.push(`✅ Nhóm B (Trung Bình): ${groupB.length} người`)
    algorithmSteps.value.push(`✅ Nhóm C (Hỗ Trợ): ${groupC.length} người`)
    
    // Bước 2: Tìm người cao nhất và thấp nhất trong TẤT CẢ 28 người
    const allPlayers = [...props.players]
    const sortedAllPlayers = allPlayers.sort((a, b) => b.rank - a.rank)
    const globalHighestPlayer = sortedAllPlayers[0] // Người 23 điểm
    const globalLowestPlayer = sortedAllPlayers[sortedAllPlayers.length - 1] // Người 1 điểm
    
    algorithmSteps.value.push(`🎯 Người cao nhất: ${globalHighestPlayer.name} (${globalHighestPlayer.rank} điểm)`)
    algorithmSteps.value.push(`🎯 Người thấp nhất: ${globalLowestPlayer.name} (${globalLowestPlayer.rank} điểm)`)
    
    // Bước 3: Xáo trộn nhóm A và gán trụ cột
    algorithmSteps.value.push('🎲 Đang xáo trộn nhóm trụ cột...')
    await sleep(500)
    
    const shuffledGroupA = shuffleArray([...groupA])
    algorithmSteps.value.push(`✅ Đã xáo trộn ${shuffledGroupA.length} trụ cột`)
    
    // Bước 4: Tạo 7 team với trụ cột
    algorithmSteps.value.push('🏗️ Đang tạo 7 team với trụ cột...')
    await sleep(500)
    
    const teams = []
    for (let i = 0; i < 7; i++) {
      teams.push({
        id: i + 1,
        name: `Team ${i + 1}`,
        players: [shuffledGroupA[i]],
        totalPoints: shuffledGroupA[i].rank
      })
    }
    
    algorithmSteps.value.push('✅ Đã gán trụ cột cho 7 team')
    
    // Bước 5: Phân bổ ngẫu nhiên nhóm B và C
    algorithmSteps.value.push('🎯 Đang phân bổ ngẫu nhiên nhóm B và C...')
    await sleep(500)
    
    const remainingPlayers = [...groupB, ...groupC] // Không shuffle để giữ thứ tự gốc
    algorithmSteps.value.push(`✅ Có ${remainingPlayers.length} người còn lại để phân bổ`)
    
    // Thuật toán cân bằng ngẫu nhiên
    const balancedTeams = await balanceTeamsRandomly(teams, remainingPlayers, globalHighestPlayer, globalLowestPlayer)
    
    algorithmSteps.value.push('🎉 Hoàn thành! Đã chia team cân bằng ngẫu nhiên')
    
    emit('teams-generated', balancedTeams)
    
  } catch (error) {
    algorithmSteps.value.push(`❌ Lỗi: ${error.message}`)
  } finally {
    isGenerating.value = false
  }
}

const balanceTeamsRandomly = async (teams, remainingPlayers, globalHighestPlayer, globalLowestPlayer) => {
  // Thuật toán cân bằng nâng cao với Simulated Annealing
  const targetRange = { min: 42, max: 46 }
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
    // Tạo playersToAssign mới từ sortedPlayers gốc trong mỗi attempt
    const playersToAssign = attempt === 0 ? [...sortedPlayers] : shuffleArray([...sortedPlayers])
    
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
        console.log(`🔍 [Attempt ${attempt}] Tìm ${globalLowestPlayer.name} (${globalLowestPlayer.rank}) trong playersToAssign, Index: ${lowestPlayerIndex}`)
      }
      
      if (lowestPlayerIndex > -1) {
        targetTeamForGlobalPair.players.push(globalLowestPlayer)
        targetTeamForGlobalPair.totalPoints += globalLowestPlayer.rank
        playersToAssign.splice(lowestPlayerIndex, 1)
        
        // Log để debug
        if (attempt <= 2) {
          console.log(`✅ [Attempt ${attempt}] Cặp ${globalHighestPlayer.name} (${globalHighestPlayer.rank}) với ${globalLowestPlayer.name} (${globalLowestPlayer.rank}) vào ${targetTeamForGlobalPair.name}`)
        }
      } else {
        // Log để debug
        if (attempt <= 2) {
          console.warn(`⚠️ [Attempt ${attempt}] Không tìm thấy ${globalLowestPlayer.name} trong playersToAssign!`)
        }
      }
    }
    
    // Phân bổ thông minh với Constraint Satisfaction
    for (const player of playersToAssign) {
      const availableTeams = tempTeams.filter(team => team.players.length < 4)
      
      // Nếu không còn team nào có slot, dừng lại
      if (availableTeams.length === 0) {
        console.warn(`⚠️ Đã hết slot cho team, còn ${playersToAssign.length - 1} người chưa được phân bổ`)
        break
      }
      
      // Chọn team tốt nhất dựa trên multiple constraints
      const targetTeam = selectBestTeamForPlayer(player, availableTeams, tempTeams, targetRange)
      
      targetTeam.players.push(player)
      targetTeam.totalPoints += player.rank
    }
    
    // Log để debug
    if (attempt === 0) {
      const totalAssigned = tempTeams.reduce((sum, team) => sum + team.players.length, 0)
      console.log(`📊 Attempt ${attempt}: Đã phân bổ ${totalAssigned} người vào ${tempTeams.length} teams`)
      tempTeams.forEach((team, i) => {
        console.log(`   ${team.name}: ${team.players.length} người`)
      })
      
      // Log Team 5 chi tiết để tìm Kiếp
      const team5 = tempTeams.find(t => t.name === 'Team 5')
      if (team5) {
        console.log(`🔍 Team 5 chi tiết: ${team5.players.map(p => `${p.name}(${p.rank})`).join(', ')}`)
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
          console.log(`🎯 Attempt ${attempt}: New best score ${score.toFixed(2)} (${hasKiếp ? 'CÓ' : 'KHÔNG CÓ'} Kiếp trong team có Liêm)`)
        }
      }
    }
    
    // Giảm nhiệt độ theo thời gian
    if (attempt % 100 === 0) {
      temperature = Math.max(minTemperature, temperature * coolingRate)
    }
    
    // Early stopping conditions với Simulated Annealing
    if (allInRange && maxDiff <= 1 && standardDeviation < 1.0) {
      algorithmSteps.value.push(`🌟 Tìm thấy giải pháp cân bằng hoàn hảo! (SD: ${standardDeviation.toFixed(2)}, MaxDiff: ${maxDiff})`)
      console.log(`🌟 Dừng sớm tại attempt ${attempt} - Giải pháp hoàn hảo`)
      break
    }
    
    // Dừng sớm nếu đã tìm được giải pháp rất tốt và nhiệt độ đã giảm đủ
    if (attempt > 8000 && allInRange && maxDiff <= 2 && temperature < 1.0) {
      algorithmSteps.value.push(`✅ Tìm thấy giải pháp tốt sau ${attempt} lần thử! (Temp: ${temperature.toFixed(2)})`)
      console.log(`✅ Dừng tại attempt ${attempt} - Nhiệt độ thấp và giải pháp tốt`)
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
    const avgFinalPoints = finalTeamPoints.reduce((sum, points) => sum + points, 0) / finalTeamPoints.length
    const finalVariance = finalTeamPoints.reduce((sum, points) => sum + Math.pow(points - avgFinalPoints, 2), 0) / finalTeamPoints.length
    const finalSD = Math.sqrt(finalVariance)
    
    const finalReliability = calculateReliabilityScore(finalTeamPoints, finalMaxDiff, finalSD, true)
    const reliabilityLevel = getReliabilityLevel(finalReliability)
    
    // Debug: Kiểm tra số người trong mỗi team
    const teamPlayerCounts = bestSolution.map(t => t.players.length)
    const totalPlayers = teamPlayerCounts.reduce((sum, count) => sum + count, 0)
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
    algorithmSteps.value.push(`   - Tổng số người trong teams: ${totalPlayers} (Số người mỗi team: ${teamPlayerCounts.join(', ')})`)
    
    if (totalPlayers !== 28) {
      algorithmSteps.value.push(`⚠️ CẢNH BÁO: Tổng số người (${totalPlayers}) khác 28!`)
    }
    
    // Log chi tiết để debug
    console.log('🔍 Chi tiết teams trước khi emit:')
    bestSolution.forEach(team => {
      console.log(`   ${team.name}: ${team.players.length} người - ${team.players.map(p => `${p.name}(${p.rank})`).join(', ')}`)
    })
    
    // Kiểm tra Kiếp có trong team có Liêm không
    const teamWithHighest = bestSolution.find(t => t.players.some(p => p.name === globalHighestPlayer.name))
    const hasKiếp = teamWithHighest && teamWithHighest.players.some(p => p.name === globalLowestPlayer.name)
    console.log(`🔎 Kiểm tra cuối: ${hasKiếp ? '✅ CÓ Kiếp trong team có Liêm' : '❌ KHÔNG CÓ Kiếp trong team có Liêm'}`)
    if (teamWithHighest) {
      console.log(`   Team có Liêm: ${teamWithHighest.name}`)
      console.log(`   Players: ${teamWithHighest.players.map(p => `${p.name}(${p.rank})`).join(', ')}`)
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
  // Các trọng số cho từng yếu tố
  const weights = {
    range: 0.3,        // Trong khoảng mục tiêu
    variance: 0.25,    // Phương sai
    maxDiff: 0.2,      // Chênh lệch tối đa
    stdDev: 0.15,      // Độ lệch chuẩn
    category: 0.05,    // Cân bằng category
    playerCount: 0.05  // Cân bằng số lượng người
  }
  
  // Tính điểm cho từng yếu tố
  const rangeScore = allInRange ? 0 : 1000 // Penalty lớn nếu không trong khoảng
  const varianceScore = variance * 10
  const maxDiffScore = maxDiff * 20
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
const selectBestTeamForPlayer = (player, availableTeams, allTeams, targetRange) => {
  let bestTeam = availableTeams[0]
  let bestScore = -Infinity
  
  for (const team of availableTeams) {
    let score = 0
    
    // Constraint 1: Ưu tiên team có điểm thấp nhất (cân bằng điểm)
    const currentPoints = team.totalPoints
    const projectedPoints = currentPoints + player.rank
    const avgPoints = allTeams.reduce((sum, t) => sum + t.totalPoints, 0) / allTeams.length
    
    // Điểm càng thấp so với trung bình càng tốt
    score += (avgPoints - currentPoints) * 10
    
    // Constraint 2: Ưu tiên team trong khoảng mục tiêu sau khi thêm player
    if (projectedPoints >= targetRange.min && projectedPoints <= targetRange.max) {
      score += 50
    } else {
      // Penalty nếu vượt quá khoảng mục tiêu
      const overage = Math.max(0, projectedPoints - targetRange.max)
      const underage = Math.max(0, targetRange.min - projectedPoints)
      score -= (overage + underage) * 5
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
    A: players.filter(p => p.rank >= 17).length,
    B: players.filter(p => p.rank >= 7 && p.rank <= 16).length,
    C: players.filter(p => p.rank <= 6).length
  }
}

// Lấy category của player
const getPlayerCategory = (rank) => {
  if (rank >= 17) return 'A'
  if (rank >= 7) return 'B'
  return 'C'
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
    console.log('🔄 Chưa có teams, bắt đầu generate...')
    generateTeams()
  } else {
    console.log('✅ Đã có teams, không generate lại')
  }
})
</script>
