<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto p-5">
        <div class="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 class="text-2xl font-bold text-gray-800">Chiếc nón kỳ diệu</h3>
            <p class="text-sm text-gray-600">Chọn đội, rồi bấm quay. Nón sẽ dừng lần lượt vào từng người của đội đó.</p>
          </div>
          <button @click="close" class="text-gray-500 hover:text-gray-800 text-xl px-2" :disabled="spinning">✕</button>
        </div>

        <div class="grid lg:grid-cols-[auto_1fr] gap-5 items-start">
        <div class="flex justify-center pt-2">
          <div class="relative" :style="{ width: wheelSize + 'px', height: wheelSize + 'px' }">
            <div class="absolute left-1/2 -translate-x-1/2 -top-1 z-20 h-0 w-0 border-l-[14px] border-r-[14px] border-t-[26px] border-l-transparent border-r-transparent border-t-gray-900"></div>
            <div
              class="absolute inset-0"
              :style="{ transform: `rotate(${rotation}deg)`, transition: spinningTurn ? 'transform 2.6s cubic-bezier(0.12, 0.75, 0.15, 1)' : 'none' }"
            >
              <div class="absolute inset-0 rounded-full border-8 border-amber-400 shadow-lg overflow-hidden">
                <div class="absolute inset-0" :style="{ background: wheelBackground }"></div>
              </div>
              <div
                v-for="(player, index) in players"
                :key="player._key || player.name"
                class="absolute left-1/2 top-1/2 h-0 origin-left"
                :style="{ width: '46%', transform: `rotate(${labelAngle(index)}deg)` }"
              >
                <span class="absolute left-[24%] top-0 -translate-y-1/2 whitespace-nowrap">
                  <span
                    class="block font-bold text-white"
                    :style="{ fontSize: labelSize, textShadow: '0 1px 2px rgba(0,0,0,0.85)', transform: textFlip(index) }"
                  >
                    {{ player.name }}
                  </span>
                </span>
              </div>
            </div>
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-amber-300 border-4 border-amber-600"></div>
          </div>
        </div>

        <div>
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="team in teams"
            :key="team.id"
            @click="selectTeam(team.id)"
            :disabled="spinning"
            class="px-3 py-2 rounded-lg border text-sm font-medium"
            :class="selectedTeamId === team.id ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-800 border-gray-300'"
          >
            {{ team.name }}
            <span class="opacity-80">{{ revealedCount(team) }}/{{ team.players.length }}</span>
          </button>
        </div>

        <div class="flex items-center justify-between gap-3 mb-4">
          <p class="text-sm text-gray-600">{{ statusText }}</p>
          <button
            @click="spinSelectedTeam"
            :disabled="!selectedTeam || spinning || remainingPlayers.length === 0"
            class="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-bold px-5 py-2 rounded-lg"
          >
            {{ spinning ? 'Đang quay...' : 'Quay' }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="team in teams"
            :key="'list-' + team.id"
            class="rounded-lg border p-3"
            :class="selectedTeamId === team.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'"
          >
            <div class="font-semibold text-gray-800 mb-2">{{ team.name }}</div>
            <ul class="space-y-1">
              <li
                v-for="player in revealedPlayers(team)"
                :key="player._key || player.name"
                class="flex justify-between bg-white rounded px-2 py-1 text-sm"
              >
                <span>{{ player.name }}</span>
                <span class="font-semibold">{{ player.rank }}</span>
              </li>
              <li v-if="revealedPlayers(team).length === 0" class="text-sm text-gray-400">Chưa quay</li>
            </ul>
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'

const props = defineProps({
  players: { type: Array, required: true },
  teams: { type: Array, required: true }
})

const emit = defineEmits(['close'])

const colors = ['#dc2626', '#d97706', '#15803d', '#1d4ed8', '#7e22ce', '#be185d', '#0f766e', '#b45309']
const selectedTeamId = ref(props.teams[0]?.id || '')
const revealedKeys = ref([])
const rotation = ref(0)
const spinning = ref(false)
const spinningTurn = ref(false)
const landedName = ref('')

const wheelSize = computed(() => (props.players.length > 12 ? 460 : 400))
const slice = computed(() => 360 / Math.max(props.players.length, 1))
const labelSize = computed(() => (props.players.length > 12 ? '10px' : '12px'))

const wheelBackground = computed(() => {
  const stops = props.players.map((_, index) => {
    const color = colors[index % colors.length]
    return `${color} ${index * slice.value}deg ${(index + 1) * slice.value}deg`
  })
  return `conic-gradient(from -90deg, ${stops.join(', ')})`
})

const selectedTeam = computed(() => props.teams.find(team => team.id === selectedTeamId.value) || null)
const remainingPlayers = computed(() => {
  if (!selectedTeam.value) return []
  return selectedTeam.value.players.filter(player => !revealedKeys.value.includes(playerKey(player)))
})

const statusText = computed(() => {
  if (!selectedTeam.value) return 'Chọn một đội trước khi quay.'
  if (spinning.value && landedName.value) return `Vào ${selectedTeam.value.name}: ${landedName.value}`
  if (remainingPlayers.value.length === 0) return `${selectedTeam.value.name} đã đủ người.`
  return `${selectedTeam.value.name} còn ${remainingPlayers.value.length} người.`
})

function playerKey(player) {
  return player._key || player.name
}

function labelAngle(index) {
  return -90 + (index + 0.5) * slice.value
}

function textFlip(index) {
  const angle = ((labelAngle(index) % 360) + 360) % 360
  const flip = angle > 90 && angle < 270
  return flip ? 'rotate(180deg)' : 'none'
}

function revealedPlayers(team) {
  return team.players.filter(player => revealedKeys.value.includes(playerKey(player)))
}

function revealedCount(team) {
  return revealedPlayers(team).length
}

function selectTeam(id) {
  if (spinning.value) return
  selectedTeamId.value = id
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function targetRotation(player) {
  const index = props.players.findIndex(item => playerKey(item) === playerKey(player))
  const center = (index + 0.5) * slice.value
  const turns = 5
  const current = rotation.value
  const unwrapped = current - (current % 360)
  let next = unwrapped + turns * 360 - center
  if (next <= current + 20) next += 360
  return next
}

async function spinSelectedTeam() {
  if (!selectedTeam.value || spinning.value || remainingPlayers.value.length === 0) return
  const queue = [...remainingPlayers.value]
  for (let index = queue.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[queue[index], queue[swap]] = [queue[swap], queue[index]]
  }
  spinning.value = true
  spinningTurn.value = true
  await nextTick()
  await wait(40)
  for (const player of queue) {
    rotation.value = targetRotation(player)
    await wait(2700)
    landedName.value = player.name
    revealedKeys.value = [...revealedKeys.value, playerKey(player)]
    await wait(450)
  }
  spinning.value = false
  spinningTurn.value = false
}

function close() {
  if (spinning.value) return
  emit('close')
}
</script>
