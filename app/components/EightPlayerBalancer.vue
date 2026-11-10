<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-semibold text-gray-800 mb-2">
      Chọn 8 người, chia 2 team 4v4
    </h2>
    <p class="text-gray-600 mb-4">
      Chỉ 8 người được chọn mới được đưa vào trận. Hai team mỗi bên 4 người, ưu tiên tổng điểm lệch ít nhất (mục tiêu 0–3 điểm).
    </p>
    <div v-if="presetNames.length" class="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
      Đã thêm {{ presetNames.length }} tên từ ảnh và chọn sẵn. Ảnh không có điểm, hãy điền điểm từng người rồi chia team.
    </div>

    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
      <div class="text-gray-800">
        Đã chọn:
        <span class="font-bold" :class="selectedPlayers.length === 8 ? 'text-green-600' : 'text-blue-600'">
          {{ selectedPlayers.length }}/8
        </span>
        <span v-if="selectedPlayers.length === 8" class="text-sm text-gray-500 ml-2">
          Tổng {{ selectedTotal }} điểm · mục tiêu mỗi team {{ targetLow }}–{{ targetHigh }}
        </span>
      </div>
      <div class="flex flex-wrap gap-2">
        <input
          v-model="query"
          type="text"
          placeholder="Tìm tên..."
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="clearSelection"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg border"
        >
          Bỏ chọn
        </button>
        <button
          @click="generateTwoTeams"
          :disabled="!canSplit || isSplitting"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium"
        >
          {{ isSplitting ? 'Đang chia...' : 'Chia 2 team cân bằng' }}
        </button>
      </div>
    </div>

    <div v-if="selectedPlayers.length > 0" class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="player in selectedPlayers"
        :key="player._key"
        @click="toggleSelect(player)"
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border"
        :class="badgeClass(player.rank)"
        title="Bấm để bỏ chọn"
      >
        <span>{{ player.name }}</span>
        <span class="font-semibold">{{ player.rank }}</span>
      </button>
    </div>

    <p v-if="selectedPlayers.length === 8 && !canSplit" class="mb-3 text-sm text-amber-700">
      8 người đã được chọn. Điền điểm (1–23) cho người còn trống rồi mới chia team.
    </p>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[28rem] overflow-y-auto pr-1">
      <div
        v-for="player in visiblePlayers"
        :key="player._key"
        @click="toggleSelect(player)"
        class="p-3 border-2 rounded-lg text-left transition-all"
        :class="cardClass(player)"
      >
        <div class="font-medium">{{ player.name }}</div>
        <div class="mt-2 flex items-center justify-between gap-2 text-sm">
          <span class="px-2 py-0.5 rounded-full text-xs" :class="isSelected(player) ? 'bg-white/20' : badgeClass(player.rank)">
            {{ player.rank ? categoryLabel(player.rank) : 'Chưa có điểm' }}
          </span>
          <input
            :value="player.rank ?? ''"
            type="number"
            min="1"
            max="23"
            placeholder="Điểm"
            class="w-16 px-2 py-1 rounded border text-right text-sm text-gray-800"
            @click.stop
            @input="onRankInput(player, $event)"
          />
        </div>
      </div>
    </div>
    <p v-if="visiblePlayers.length === 0" class="mt-4 text-sm text-gray-500">Không thấy người chơi khớp từ khóa.</p>

    <div v-if="result" class="mt-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 class="text-xl font-bold text-gray-800">Kết quả 4v4</h3>
          <p class="text-sm text-gray-600">
            Đã xét {{ result.examined }} cách chia. Chênh lệch nhỏ nhất:
            <span class="font-semibold" :class="diffClass(result.diff)">{{ result.diff }} điểm</span>
            <span v-if="result.optionCount > 1"> · {{ result.optionCount }} phương án cùng mức</span>
          </p>
        </div>
        <button
          @click="randomizeAmongBest"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          {{ result.optionCount > 1 ? 'Đổi phương án khác' : 'Quay chiếc nón' }}
        </button>
      </div>

      <div
        class="mb-4 p-3 rounded-lg text-sm"
        :class="result.diff <= 3 ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'"
      >
        <span v-if="result.diff <= 2">Hai team lệch {{ result.diff }} điểm, nằm trong mục tiêu cân bằng.</span>
        <span v-else-if="result.diff === 3">Hai team lệch 3 điểm, vẫn trong khoảng chấp nhận 2–3 điểm.</span>
        <span v-else>Với 8 người này, cách chia đều nhất vẫn lệch {{ result.diff }} điểm. Không có cách nào gần hơn.</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="team in [result.teamA, result.teamB]"
          :key="team.name"
          class="border-2 rounded-lg p-4"
          :class="result.diff <= 3 ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-lg text-gray-800">{{ team.name }}</h3>
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-800">{{ team.totalPoints }}</div>
              <div class="text-xs text-gray-600">điểm</div>
            </div>
          </div>
          <ul class="space-y-2">
            <li
              v-for="player in sorted(team.players)"
              :key="player._key"
              class="flex items-center justify-between bg-white rounded px-3 py-2"
            >
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-800">{{ player.name }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full" :class="badgeClass(player.rank)">
                  {{ categoryLabel(player.rank) }}
                </span>
              </div>
              <span class="font-semibold text-gray-700">{{ player.rank }}</span>
            </li>
          </ul>
          <div class="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
            <span v-for="item in gradeSummary(team.players, rosterScale.bands)" :key="item.id">{{ item.label }}: {{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>
    <FortuneWheel
      v-if="wheel"
      :players="wheel.players"
      :teams="wheel.teams"
      @close="wheel = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { gradeScale, gradeForScore, gradeSummary } from '../utils/playerGrade.js'

const props = defineProps({
  players: { type: Array, required: true },
  presetNames: { type: Array, default: () => [] }
})

const emit = defineEmits(['rank-change'])

const query = ref('')
const selectedKeys = ref([])
const bestSplits = ref([])
const result = ref(null)
const wheel = ref(null)
const isSplitting = ref(false)
const appliedPreset = ref(false)

const keyedPlayers = computed(() =>
  props.players
    .map((player, index) => ({
      name: player.name,
      rank: player.rank ? Number(player.rank) : null,
      _key: `${index}::${player.name}`
    }))
    .filter(player => player.name)
)

const selectedPlayers = computed(() =>
  keyedPlayers.value.filter(player => selectedKeys.value.includes(player._key))
)

const presetOrder = computed(() => new Map(props.presetNames.map((name, index) => [name.toLowerCase(), index])))

const visiblePlayers = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  const list = [...keyedPlayers.value].sort((a, b) => {
    const aPreset = presetOrder.value.has(a.name.toLowerCase()) ? presetOrder.value.get(a.name.toLowerCase()) : 1000
    const bPreset = presetOrder.value.has(b.name.toLowerCase()) ? presetOrder.value.get(b.name.toLowerCase()) : 1000
    if (aPreset !== bPreset) return aPreset - bPreset
    return (b.rank || 0) - (a.rank || 0) || a.name.localeCompare(b.name, 'vi')
  })
  if (!keyword) return list
  return list.filter(player => player.name.toLowerCase().includes(keyword))
})

const canSplit = computed(() =>
  selectedPlayers.value.length === 8 && selectedPlayers.value.every(player => player.rank >= 1 && player.rank <= 23)
)

const selectedTotal = computed(() => selectedPlayers.value.reduce((sum, player) => sum + (player.rank || 0), 0))
const targetLow = computed(() => Math.floor(selectedTotal.value / 2))
const targetHigh = computed(() => Math.ceil(selectedTotal.value / 2))

const isSelected = (player) => selectedKeys.value.includes(player._key)

const toggleSelect = (player) => {
  const index = selectedKeys.value.indexOf(player._key)
  if (index >= 0) {
    selectedKeys.value.splice(index, 1)
    result.value = null
    bestSplits.value = []
    return
  }
  if (selectedKeys.value.length >= 8) return
  selectedKeys.value.push(player._key)
  result.value = null
  bestSplits.value = []
}

const clearSelection = () => {
  selectedKeys.value = []
  result.value = null
  bestSplits.value = []
}

const onRankInput = (player, event) => {
  const raw = event.target.value
  const rank = raw === '' ? null : Number(raw)
  emit('rank-change', { name: player.name, rank: Number.isFinite(rank) ? rank : null })
  result.value = null
  bestSplits.value = []
}

watch(keyedPlayers, () => {
  if (appliedPreset.value || props.presetNames.length === 0) return
  const wanted = new Set(props.presetNames.map(name => name.toLowerCase()))
  const keys = keyedPlayers.value
    .filter(player => wanted.has(player.name.toLowerCase()))
    .map(player => player._key)
  if (keys.length === 0) return
  selectedKeys.value = keys.slice(0, 8)
  appliedPreset.value = true
}, { immediate: true })

const rosterScale = computed(() => gradeScale(props.players))

const categoryOf = (rank) => gradeForScore(rank, rosterScale.value.bands)?.id || ''

const categoryLabel = (rank) => gradeForScore(rank, rosterScale.value.bands)?.label || 'Chưa có điểm'

const cardClass = (player) => {
  if (isSelected(player)) return 'bg-blue-600 border-blue-700 text-white cursor-pointer'
  if (selectedPlayers.value.length >= 8) return 'bg-gray-50 border-gray-200 text-gray-400'
  return 'bg-white border-gray-200 hover:border-blue-400 text-gray-800 cursor-pointer'
}

const badgeClass = (rank) => gradeForScore(rank, rosterScale.value.bands)?.badgeClass || 'bg-gray-100 text-gray-600 border border-gray-300'

const diffClass = (diff) => {
  if (diff <= 2) return 'text-green-700'
  if (diff === 3) return 'text-yellow-700'
  return 'text-amber-700'
}

const countCategory = (players, category) => players.filter(player => categoryOf(player.rank) === category).length

const sorted = (players) => [...players].sort((a, b) => b.rank - a.rank)

const categoryGap = (teamA, teamB) => {
  return rosterScale.value.bands.reduce((gap, grade) => {
    return gap + Math.abs(countCategory(teamA, grade.id) - countCategory(teamB, grade.id))
  }, 0)
}

const combinations = (array, size) => {
  const result = []
  const combo = []
  const walk = (start, depth) => {
    if (depth === size) {
      result.push(combo.slice())
      return
    }
    for (let i = start; i <= array.length - (size - depth); i++) {
      combo.push(array[i])
      walk(i + 1, depth + 1)
      combo.pop()
    }
  }
  walk(0, 0)
  return result
}

const splitTwoBalancedTeams = (eightPlayers) => {
  const combos = combinations(eightPlayers, 4)
  let best = []
  let bestDiff = Infinity
  let bestGap = Infinity
  const seen = new Set()

  for (const teamA of combos) {
    const teamB = eightPlayers.filter(player => !teamA.some(picked => picked._key === player._key))
    const keyA = teamA.map(player => player._key).sort().join('|')
    const keyB = teamB.map(player => player._key).sort().join('|')
    const canon = keyA < keyB ? `${keyA}#${keyB}` : `${keyB}#${keyA}`
    if (seen.has(canon)) continue
    seen.add(canon)

    const sumA = teamA.reduce((sum, player) => sum + player.rank, 0)
    const sumB = teamB.reduce((sum, player) => sum + player.rank, 0)
    const diff = Math.abs(sumA - sumB)
    const gap = categoryGap(teamA, teamB)
    const better = diff < bestDiff || (diff === bestDiff && gap < bestGap)
    const equal = diff === bestDiff && gap === bestGap

    if (better) {
      bestDiff = diff
      bestGap = gap
      best = [{ teamA, teamB, sumA, sumB, diff }]
    } else if (equal) {
      best.push({ teamA, teamB, sumA, sumB, diff })
    }
  }

  return { best, examined: seen.size }
}

const applySplit = (pick, examined, optionCount) => {
  const [first, second] = pick.sumA >= pick.sumB
    ? [
        { name: 'Team A', players: pick.teamA, totalPoints: pick.sumA },
        { name: 'Team B', players: pick.teamB, totalPoints: pick.sumB }
      ]
    : [
        { name: 'Team A', players: pick.teamB, totalPoints: pick.sumB },
        { name: 'Team B', players: pick.teamA, totalPoints: pick.sumA }
      ]

  result.value = {
    teamA: first,
    teamB: second,
    diff: pick.diff,
    examined,
    optionCount
  }
}

const generateTwoTeams = () => {
  if (!canSplit.value) return
  isSplitting.value = true
  const { best, examined } = splitTwoBalancedTeams(selectedPlayers.value)
  bestSplits.value = best
  if (best.length > 0) {
    const pick = best[Math.floor(Math.random() * best.length)]
    applySplit(pick, examined, best.length)
  }
  isSplitting.value = false
}

const openWheel = (teamA, teamB) => {
  wheel.value = {
    players: [...teamA.players, ...teamB.players],
    teams: [
      { id: 'A', name: 'Đội A', players: teamA.players },
      { id: 'B', name: 'Đội B', players: teamB.players }
    ]
  }
}

const splitSignature = (teamA, teamB) => {
  const keyOf = players => players.map(player => player._key).sort().join('|')
  const left = keyOf(teamA)
  const right = keyOf(teamB)
  return left < right ? `${left}#${right}` : `${right}#${left}`
}

const randomizeAmongBest = () => {
  if (!result.value) return
  if (bestSplits.value.length > 1) {
    const current = splitSignature(result.value.teamA.players, result.value.teamB.players)
    const others = bestSplits.value.filter(pick => splitSignature(pick.teamA, pick.teamB) !== current)
    const pool = others.length > 0 ? others : bestSplits.value
    const pick = pool[Math.floor(Math.random() * pool.length)]
    applySplit(pick, result.value.examined || bestSplits.value.length, bestSplits.value.length)
  }
  openWheel(result.value.teamA, result.value.teamB)
}
</script>
