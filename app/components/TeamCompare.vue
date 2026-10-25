<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-semibold text-gray-800 mb-2">So sánh 2 đội</h2>
    <p class="text-gray-600 mb-4">
      Chọn đủ người cho mỗi đội rồi xem đội nào có tổng điểm cao hơn. 2v2 là 2 người mỗi đội, 4v4 là 4 người mỗi đội.
    </p>

    <div class="flex flex-wrap gap-2 mb-4">
      <button
        @click="setMode(2)"
        class="px-4 py-2 rounded-lg font-medium"
        :class="teamSize === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
      >
        2v2
      </button>
      <button
        @click="setMode(4)"
        class="px-4 py-2 rounded-lg font-medium"
        :class="teamSize === 4 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
        :disabled="rankedCount < 8"
      >
        4v4
      </button>
      <input
        v-model="query"
        type="text"
        placeholder="Tìm tên..."
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button @click="clearTeams" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg border">
        Xóa hai đội
      </button>
    </div>
    <p v-if="rankedCount < 8" class="text-sm text-amber-700 mb-4">
      Cần ít nhất 8 người đã có điểm để so 4v4. Hiện có {{ rankedCount }} người có điểm.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div
        v-for="side in sides"
        :key="side.id"
        class="rounded-lg border-2 p-4"
        :class="side.boxClass"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-lg">{{ side.name }}</h3>
          <div class="text-right">
            <div class="text-2xl font-bold">{{ side.total }}</div>
            <div class="text-xs opacity-80">{{ side.players.length }}/{{ teamSize }} người</div>
          </div>
        </div>
        <ul class="space-y-2 min-h-16">
          <li
            v-for="player in side.players"
            :key="player._key"
            class="flex items-center justify-between bg-white rounded px-3 py-2 text-gray-800"
          >
            <span class="flex items-center gap-2">
              <span class="font-medium">{{ player.name }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="badgeClass(player.rank)">
                {{ categoryLabel(player.rank) }}
              </span>
            </span>
            <span class="flex items-center gap-2">
              <span class="font-semibold">{{ player.rank }}</span>
              <button @click="removePlayer(player)" class="text-red-600 text-sm" title="Bỏ khỏi đội">✕</button>
            </span>
          </li>
          <li v-if="side.players.length === 0" class="text-sm opacity-70">Chưa chọn người</li>
        </ul>
      </div>
    </div>

    <div v-if="comparison" class="mb-6 rounded-lg border p-4" :class="comparison.boxClass">
      <h3 class="text-xl font-bold mb-1">{{ comparison.title }}</h3>
      <p class="mb-4">{{ comparison.detail }}</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div class="bg-white/80 rounded p-3 text-gray-800">
          <div class="text-gray-500">Tổng điểm</div>
          <div class="font-semibold">Đội A {{ comparison.totalA }} · Đội B {{ comparison.totalB }}</div>
        </div>
        <div class="bg-white/80 rounded p-3 text-gray-800">
          <div class="text-gray-500">Điểm trung bình</div>
          <div class="font-semibold">Đội A {{ comparison.avgA }} · Đội B {{ comparison.avgB }}</div>
        </div>
        <div class="bg-white/80 rounded p-3 text-gray-800">
          <div class="text-gray-500">Người cao điểm nhất</div>
          <div class="font-semibold">{{ comparison.topA }} · {{ comparison.topB }}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[28rem] overflow-y-auto pr-1">
      <div
        v-for="player in visiblePlayers"
        :key="player._key"
        class="p-3 border-2 rounded-lg text-left"
        :class="cardClass(player)"
      >
        <div class="font-medium">{{ player.name }}</div>
        <div class="mt-1 flex items-center justify-between gap-2 text-sm">
          <span class="px-2 py-0.5 rounded-full text-xs" :class="badgeClass(player.rank)">
            {{ player.rank ? categoryLabel(player.rank) : 'Chưa có điểm' }}
          </span>
          <span class="font-semibold">{{ player.rank ?? '—' }}</span>
        </div>
        <div class="mt-2 flex gap-2">
          <button
            @click="assign(player, 'A')"
            :disabled="!player.rank || (teamOf(player) !== 'A' && teamA.length >= teamSize)"
            class="flex-1 px-2 py-1 rounded text-sm font-medium disabled:opacity-40"
            :class="teamOf(player) === 'A' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'"
          >
            {{ teamOf(player) === 'A' ? 'Đang ở A' : 'Vào A' }}
          </button>
          <button
            @click="assign(player, 'B')"
            :disabled="!player.rank || (teamOf(player) !== 'B' && teamB.length >= teamSize)"
            class="flex-1 px-2 py-1 rounded text-sm font-medium disabled:opacity-40"
            :class="teamOf(player) === 'B' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'"
          >
            {{ teamOf(player) === 'B' ? 'Đang ở B' : 'Vào B' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { gradeScale, gradeForScore, gradeSummary } from '../utils/playerGrade.js'

const props = defineProps({
  players: { type: Array, required: true }
})

const query = ref('')
const teamSize = ref(2)
const teamAKeys = ref([])
const teamBKeys = ref([])

const keyedPlayers = computed(() =>
  props.players
    .map((player, index) => ({
      name: player.name,
      rank: player.rank ? Number(player.rank) : null,
      _key: `${index}::${player.name}`
    }))
    .filter(player => player.name)
)

const rosterScale = computed(() => gradeScale(props.players))
const rankedCount = computed(() => keyedPlayers.value.filter(player => player.rank >= 1).length)
const byKey = computed(() => new Map(keyedPlayers.value.map(player => [player._key, player])))

const teamA = computed(() => teamAKeys.value.map(key => byKey.value.get(key)).filter(Boolean))
const teamB = computed(() => teamBKeys.value.map(key => byKey.value.get(key)).filter(Boolean))

const visiblePlayers = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  const list = [...keyedPlayers.value].sort((a, b) => (b.rank || 0) - (a.rank || 0) || a.name.localeCompare(b.name, 'vi'))
  if (!keyword) return list
  return list.filter(player => player.name.toLowerCase().includes(keyword))
})

const totalOf = (players) => players.reduce((sum, player) => sum + (player.rank || 0), 0)
const sorted = (players) => [...players].sort((a, b) => b.rank - a.rank)

const sides = computed(() => [
  {
    id: 'A',
    name: 'Đội A',
    players: sorted(teamA.value),
    total: totalOf(teamA.value),
    boxClass: 'border-blue-300 bg-blue-50 text-blue-950'
  },
  {
    id: 'B',
    name: 'Đội B',
    players: sorted(teamB.value),
    total: totalOf(teamB.value),
    boxClass: 'border-rose-300 bg-rose-50 text-rose-950'
  }
])

const comparison = computed(() => {
  if (teamA.value.length !== teamSize.value || teamB.value.length !== teamSize.value) return null
  const totalA = totalOf(teamA.value)
  const totalB = totalOf(teamB.value)
  const diff = Math.abs(totalA - totalB)
  const top = (players) => {
    const best = sorted(players)[0]
    return `${best.name} ${best.rank}`
  }
  const grades = (players) => gradeSummary(players, rosterScale.value.bands).map(item => `${item.label} ×${item.count}`).join(', ')
  let title = 'Hai đội cân bằng'
  let boxClass = 'border-gray-300 bg-gray-50 text-gray-800'
  if (totalA > totalB) {
    title = `Đội A mạnh hơn ${diff} điểm`
    boxClass = 'border-blue-300 bg-blue-50 text-blue-950'
  } else if (totalB > totalA) {
    title = `Đội B mạnh hơn ${diff} điểm`
    boxClass = 'border-rose-300 bg-rose-50 text-rose-950'
  }
  return {
    title,
    detail: `Hạng Đội A: ${grades(teamA.value) || '—'}. Hạng Đội B: ${grades(teamB.value) || '—'}.`,
    boxClass,
    totalA,
    totalB,
    avgA: (totalA / teamSize.value).toFixed(1),
    avgB: (totalB / teamSize.value).toFixed(1),
    topA: top(teamA.value),
    topB: top(teamB.value)
  }
})

const teamOf = (player) => {
  if (teamAKeys.value.includes(player._key)) return 'A'
  if (teamBKeys.value.includes(player._key)) return 'B'
  return ''
}

const assign = (player, side) => {
  if (!player.rank) return
  const current = teamOf(player)
  teamAKeys.value = teamAKeys.value.filter(key => key !== player._key)
  teamBKeys.value = teamBKeys.value.filter(key => key !== player._key)
  if (current === side) return
  const target = side === 'A' ? teamAKeys : teamBKeys
  if (target.value.length >= teamSize.value) return
  target.value.push(player._key)
}

const removePlayer = (player) => {
  teamAKeys.value = teamAKeys.value.filter(key => key !== player._key)
  teamBKeys.value = teamBKeys.value.filter(key => key !== player._key)
}

const clearTeams = () => {
  teamAKeys.value = []
  teamBKeys.value = []
}

const setMode = (size) => {
  if (size === teamSize.value) return
  if (size === 4 && rankedCount.value < 8) return
  teamSize.value = size
  clearTeams()
}

const categoryLabel = (rank) => gradeForScore(rank, rosterScale.value.bands)?.label || 'Chưa có điểm'
const badgeClass = (rank) => gradeForScore(rank, rosterScale.value.bands)?.badgeClass || 'bg-gray-100 text-gray-600 border border-gray-300'

const cardClass = (player) => {
  if (teamOf(player) === 'A') return 'border-blue-500 bg-blue-50'
  if (teamOf(player) === 'B') return 'border-rose-500 bg-rose-50'
  if (!player.rank) return 'border-gray-200 bg-gray-50 text-gray-400'
  return 'border-gray-200 bg-white'
}
</script>
