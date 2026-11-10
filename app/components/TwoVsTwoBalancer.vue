<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-semibold text-gray-800 mb-2">
      Chọn danh sách, chia trận 2v2
    </h2>
    <p class="text-gray-600 mb-4">
      Mỗi đội 2 người. Cứ 4 người tạo một trận 2v2. Chọn 4, 8, 12, 16... người đã có điểm. Các đội được ghép sao cho tổng điểm trong từng trận lệch ít nhất.
    </p>

    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
      <div class="text-gray-800">
        Đã chọn:
        <span class="font-bold" :class="canSplit ? 'text-green-600' : 'text-blue-600'">
          {{ selectedPlayers.length }}
        </span>
        <span v-if="selectionHint" class="text-sm text-gray-500 ml-2">{{ selectionHint }}</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <input
          v-model="query"
          type="text"
          placeholder="Tìm tên..."
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="selectAllRanked"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg border"
        >
          Chọn tất cả có điểm
        </button>
        <button
          @click="clearSelection"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg border"
        >
          Bỏ chọn
        </button>
        <button
          @click="generate"
          :disabled="!canSplit || isSplitting"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium"
        >
          {{ isSplitting ? 'Đang chia...' : 'Chia 2v2 cân bằng' }}
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
        <span class="font-semibold">{{ player.rank ?? '…' }}</span>
      </button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[28rem] overflow-y-auto pr-1">
      <div
        v-for="player in visiblePlayers"
        :key="player._key"
        @click="toggleSelect(player)"
        class="p-3 border-2 rounded-lg text-left transition-all cursor-pointer"
        :class="isSelected(player) ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-gray-200 hover:border-blue-400 text-gray-800'"
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

    <div v-if="result" class="mt-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 class="text-xl font-bold text-gray-800">{{ result.matches.length }} trận 2v2</h3>
          <p class="text-sm text-gray-600">
            {{ result.exact ? 'Đã xét hết cách ghép đội' : 'Đã dò các cách ghép đội' }}.
            Chênh lệch lớn nhất trong một trận:
            <span class="font-semibold" :class="diffClass(result.matchDiff)">{{ result.matchDiff }} điểm</span>.
            Đội mạnh nhất và yếu nhất lệch {{ result.pairDiff }} điểm.
            <span v-if="result.optionCount > 1"> · {{ result.optionCount }} phương án cùng mức</span>
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-if="undoStack.length"
            @click="undoSplit"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
          >
            Quay lại
          </button>
          <button
            @click="randomizeAmongBest"
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            {{ result.optionCount > 1 ? 'Đổi phương án khác' : 'Quay chiếc nón' }}
          </button>
        </div>
        <p v-if="alternateNotice" class="text-sm text-amber-700">{{ alternateNotice }}</p>
      </div>

      <div v-if="!wheel" class="space-y-4">
        <div
          v-for="(match, index) in result.matches"
          :key="index"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-bold text-gray-800">Trận {{ index + 1 }}</h4>
            <span class="text-sm font-semibold" :class="diffClass(match.diff)">Lệch {{ match.diff }} điểm</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="side in [{ name: 'Đội A', team: match.teamA }, { name: 'Đội B', team: match.teamB }]"
              :key="side.name"
              class="rounded-lg p-3 border"
              :class="match.diff <= 3 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-semibold text-gray-800">{{ side.name }}</span>
                <span class="text-xl font-bold text-gray-800">{{ side.team.totalPoints }}</span>
              </div>
              <ul class="space-y-1">
                <li
                  v-for="player in side.team.players"
                  :key="player._key"
                  class="flex items-center justify-between bg-white rounded px-2 py-1"
                >
                  <span class="flex items-center gap-2">
                    <span class="font-medium text-gray-800">{{ player.name }}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full" :class="badgeClass(player.rank)">
                      {{ categoryLabel(player.rank) }}
                    </span>
                  </span>
                  <span class="font-semibold text-gray-700">{{ player.rank }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <FortuneWheel
      v-if="wheel"
      :players="wheel.players"
      :teams="wheel.teams"
      @complete="commitPendingOption"
      @close="closeWheel"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { gradeScale, gradeForScore } from '../utils/playerGrade.js'
import { planTwoVsTwo } from '../utils/twoVsTwo.js'

const props = defineProps({
  players: { type: Array, required: true }
})

const emit = defineEmits(['rank-change'])

const query = ref('')
const selectedKeys = ref([])
const options = ref([])
const result = ref(null)
const wheel = ref(null)
const pendingOption = ref(null)
const planInfo = ref({ exact: false })
const undoStack = ref([])
const alternateNotice = ref('')
const isSplitting = ref(false)

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
const selectedPlayers = computed(() => keyedPlayers.value.filter(player => selectedKeys.value.includes(player._key)))

const visiblePlayers = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  const list = [...keyedPlayers.value].sort((a, b) => (b.rank || 0) - (a.rank || 0) || a.name.localeCompare(b.name, 'vi'))
  if (!keyword) return list
  return list.filter(player => player.name.toLowerCase().includes(keyword))
})

const canSplit = computed(() => {
  const count = selectedPlayers.value.length
  return count >= 4 && count % 4 === 0 && selectedPlayers.value.every(player => player.rank >= 1 && player.rank <= 23)
})

const selectionHint = computed(() => {
  const count = selectedPlayers.value.length
  if (count === 0) return 'Chọn người sẽ vào giải 2v2'
  if (selectedPlayers.value.some(player => !player.rank)) return 'Điền điểm cho người còn trống'
  if (count < 4) return 'Cần ít nhất 4 người cho một trận 2v2'
  if (count % 4 !== 0) {
    const extra = count % 4
    return `Cần bội số của 4. Bớt ${extra} người hoặc thêm ${4 - extra} người`
  }
  return `${count / 4} trận · ${count / 2} đội`
})

const isSelected = (player) => selectedKeys.value.includes(player._key)

const toggleSelect = (player) => {
  const index = selectedKeys.value.indexOf(player._key)
  if (index >= 0) selectedKeys.value.splice(index, 1)
  else selectedKeys.value.push(player._key)
  result.value = null
  undoStack.value = []
  options.value = []
}

const clearSelection = () => {
  selectedKeys.value = []
  result.value = null
  undoStack.value = []
  options.value = []
}

const selectAllRanked = () => {
  selectedKeys.value = keyedPlayers.value.filter(player => player.rank >= 1).map(player => player._key)
  result.value = null
  undoStack.value = []
  options.value = []
}

const onRankInput = (player, event) => {
  const raw = event.target.value
  const rank = raw === '' ? null : Number(raw)
  emit('rank-change', { name: player.name, rank: Number.isFinite(rank) ? rank : null })
  result.value = null
  undoStack.value = []
  options.value = []
}

const categoryLabel = (rank) => gradeForScore(rank, rosterScale.value.bands)?.label || 'Chưa có điểm'
const badgeClass = (rank) => gradeForScore(rank, rosterScale.value.bands)?.badgeClass || 'bg-gray-100 text-gray-600 border border-gray-300'
const diffClass = (diff) => {
  if (diff <= 2) return 'text-green-700'
  if (diff === 3) return 'text-yellow-700'
  return 'text-amber-700'
}

const applyOption = (option, plan) => {
  result.value = {
    matches: option.matches,
    matchDiff: option.matchDiff,
    pairDiff: option.pairDiff,
    exact: plan.exact,
    optionCount: plan.options.length
  }
}

const generate = () => {
  if (!canSplit.value) return
  alternateNotice.value = ''
  isSplitting.value = true
  const plan = planTwoVsTwo(selectedPlayers.value)
  options.value = plan.options
  planInfo.value = { exact: plan.exact }
  if (plan.options.length > 0) {
    const pick = plan.options[Math.floor(Math.random() * plan.options.length)]
    pendingOption.value = pick
    openWheel(pick.matches)
  }
  isSplitting.value = false
}

const openWheel = (matches) => {
  const teams = matches.flatMap((match, index) => [
    { id: `${index}-A`, name: `Trận ${index + 1} · Đội A`, players: match.teamA.players },
    { id: `${index}-B`, name: `Trận ${index + 1} · Đội B`, players: match.teamB.players }
  ])
  wheel.value = {
    players: teams.flatMap(team => team.players),
    teams
  }
}

const optionSignature = (matches) => matches.map(match => {
  const names = side => side.players.map(player => player._key).sort().join('|')
  const left = names(match.teamA)
  const right = names(match.teamB)
  return left < right ? `${left}#${right}` : `${right}#${left}`
}).sort().join('||')

const commitPendingOption = () => {
  if (pendingOption.value) {
    undoStack.value = [...undoStack.value, result.value]
    applyOption(pendingOption.value, { exact: planInfo.value.exact, options: options.value })
    pendingOption.value = null
  }
  wheel.value = null
}

const closeWheel = () => {
  wheel.value = null
  pendingOption.value = null
}

const undoSplit = () => {
  if (undoStack.value.length === 0) return
  result.value = undoStack.value[undoStack.value.length - 1]
  undoStack.value = undoStack.value.slice(0, -1)
  wheel.value = null
  pendingOption.value = null
}

const randomizeAmongBest = () => {
  alternateNotice.value = ''
  if (!result.value) return
  if (options.value.length > 1) {
    const current = optionSignature(result.value.matches)
    const others = options.value.filter(option => optionSignature(option.matches) !== current)
    if (others.length === 0) {
      alternateNotice.value = 'Không có phương án khác cùng mức.'
      return
    }
    const pick = others[Math.floor(Math.random() * others.length)]
    pendingOption.value = pick
    openWheel(pick.matches)
    return
  }
  pendingOption.value = null
  openWheel(result.value.matches)
}
</script>
