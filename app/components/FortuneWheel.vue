<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto p-5">
        <div class="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 class="text-2xl font-bold text-gray-800">Chiếc nón kỳ diệu</h3>
            <p class="text-sm text-gray-600">Chọn đội rồi bấm quay. Kim dừng thì tên hiện lớn. Đội cuối lật từng người. Quay lại nếu chưa muốn chốt cách chia này.</p>
          </div>
          <button @click="close" class="text-gray-500 hover:text-gray-800 text-xl px-2" :disabled="spinning">✕</button>
        </div>

        <div class="grid lg:grid-cols-[auto_1fr] gap-5 items-start">
        <div class="flex justify-center pt-2">
          <div class="relative" :style="{ width: wheelSize + 'px', height: wheelSize + 'px' }">
            <div class="absolute left-1/2 -translate-x-1/2 -top-1 z-20 h-0 w-0 border-l-[14px] border-r-[14px] border-t-[26px] border-l-transparent border-r-transparent border-t-gray-900"></div>
            <div
              class="absolute inset-0"
              :style="{ transform: `rotate(${rotation}deg)`, transition: 'none' }"
            >
              <div class="absolute inset-0 rounded-full border-8 border-amber-400 shadow-lg overflow-hidden" :key="wheelPlayers.length">
                <div class="absolute inset-0" :style="{ background: wheelBackground }"></div>
                <div
                  v-for="(player, index) in wheelPlayers"
                  :key="'line-' + (player._key || player.name)"
                  class="absolute bottom-1/2 w-[3px] origin-bottom bg-white"
                  :style="{ left: 'calc(50% - 1.5px)', height: '50%', transform: `rotate(${boundaryAngle(index)}deg)` }"
                ></div>
              </div>
              <div
                v-for="(player, index) in wheelPlayers"
                :key="player._key || player.name"
                class="absolute left-1/2 top-1/2"
                :style="{ transform: `rotate(${labelAngle(index)}deg) translateX(${bandCenter}px)` }"
              >
                <span class="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center font-bold leading-none text-white" :style="{ fontSize: labelSize, textShadow: '0 1px 2px rgba(0,0,0,0.9)' }">
                  <span class="block" :style="{ transform: textFlip(index) }">
                    <span class="block">{{ player.name }}</span>
                    <span v-if="gradeLabel(player)" class="mt-1 block text-[0.85em]">{{ gradeLabel(player) }}</span>
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
          <div class="flex gap-2">
            <button
              @click="close"
              :disabled="spinning"
              class="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-bold px-5 py-2 rounded-lg"
            >
              Quay lại
            </button>
            <button
              @click="spinSelectedTeam"
              :disabled="!selectedTeam || spinning || remainingPlayers.length === 0"
              class="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-bold px-5 py-2 rounded-lg"
            >
              {{ spinning ? 'Đang quay...' : 'Quay' }}
            </button>
          </div>
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
                <span class="flex items-center gap-2">
                  <span>{{ player.name }}</span>
                  <span v-if="gradeLabel(player)" class="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-800">{{ gradeLabel(player) }}</span>
                </span>
                <span class="font-semibold">{{ player.rank }}</span>
              </li>
              <li v-if="revealedPlayers(team).length === 0" class="text-sm text-gray-400">Chưa quay</li>
            </ul>
          </div>
        </div>
        </div>
        </div>
      </div>
      <div v-if="spotlight" data-spotlight class="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
        <div class="wheel-pop bg-gray-950/95 text-white rounded-3xl px-12 py-8 text-center shadow-2xl border-4 border-amber-400">
          <div class="text-amber-300 text-sm font-semibold tracking-wide">{{ spotlight.team }}</div>
            <div class="text-5xl font-black mt-3 leading-tight max-w-[80vw]">{{ spotlight.name }}</div>
          <div v-if="spotlight.grade" class="text-3xl font-bold text-amber-200 mt-3">{{ spotlight.grade }}</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
@keyframes wheel-pop {
  from { transform: scale(0.72); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.wheel-pop { animation: wheel-pop 0.28s ease-out; }
</style>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { gradeForScore } from '../utils/playerGrade.js'

const props = defineProps({
  players: { type: Array, required: true },
  teams: { type: Array, required: true },
  bands: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'complete'])

const selectedTeamId = ref(props.teams[0]?.id || '')
const revealedKeys = ref([])
const wheelPlayers = ref([...props.players])
const rotation = ref(0)
const spinning = ref(false)
const spinningTurn = ref(false)
const landedName = ref('')
const completed = ref(false)
const autoNote = ref('')
const spotlight = ref(null)
let audioCtx = null

const wheelSize = computed(() => (wheelPlayers.value.length > 12 ? 460 : 400))
const slice = computed(() => 360 / Math.max(wheelPlayers.value.length, 1))
const labelSize = computed(() => (wheelPlayers.value.length > 12 ? '11px' : '13px'))
const bandCenter = computed(() => Math.round(wheelSize.value * 0.3))

function sliceColor(index) {
  const total = Math.max(wheelPlayers.value.length, 1)
  const hue = (index * 360) / total
  return `hsl(${hue} 70% 42%)`
}

const wheelBackground = computed(() => {
  if (wheelPlayers.value.length === 0) return '#d1d5db'
  const stops = wheelPlayers.value.map((_, index) => {
    const color = sliceColor(index)
    const start = index * slice.value
    const end = (index + 1) * slice.value
    return `${color} ${start}deg ${end}deg`
  })
  return `conic-gradient(from 0deg, ${stops.join(', ')})`
})

const selectedTeam = computed(() => props.teams.find(team => team.id === selectedTeamId.value) || null)
const remainingPlayers = computed(() => {
  if (!selectedTeam.value) return []
  return selectedTeam.value.players.filter(player => !revealedKeys.value.includes(playerKey(player)))
})

const statusText = computed(() => {
  if (autoNote.value) return autoNote.value
  if (!selectedTeam.value) return 'Chọn một đội trước khi quay.'
  if (spinning.value && landedName.value) return `Vào ${selectedTeam.value.name}: ${landedName.value}`
  if (remainingPlayers.value.length === 0) return `${selectedTeam.value.name} đã đủ người.`
  return `${selectedTeam.value.name} còn ${remainingPlayers.value.length} người.`
})

function playerKey(player) {
  return player._key || player.name
}

watch(() => props.players.map(playerKey).join('|'), () => {
  wheelPlayers.value = [...props.players]
  revealedKeys.value = []
  rotation.value = 0
  spinning.value = false
  spinningTurn.value = false
  landedName.value = ''
  completed.value = false
  autoNote.value = ''
  spotlight.value = null
  selectedTeamId.value = props.teams[0]?.id || ''
})

function gradeLabel(player) {
  return gradeForScore(player.rank, props.bands)?.label || ''
}

const SPIN_MS = 2400
const SPOT_MS = 1000
const FLIP_MS = 550

function unrevealedGroups() {
  const left = new Set(wheelPlayers.value.map(playerKey))
  return props.teams.map(team => ({
    team,
    players: team.players.filter(player => left.has(playerKey(player)))
  })).filter(group => group.players.length > 0)
}

async function placeGroup(group) {
  const players = [...group.players]
  wheelPlayers.value = wheelPlayers.value.filter(item => !players.some(player => playerKey(player) === playerKey(item)))
  rotation.value = 0
  const shown = []
  for (const player of players) {
    if (!revealedKeys.value.includes(playerKey(player))) {
      revealedKeys.value = [...revealedKeys.value, playerKey(player)]
    }
    shown.push(`${player.name}${gradeLabel(player) ? ' (' + gradeLabel(player) + ')' : ''}`)
    autoNote.value = `Còn lại vào ${group.team.name}: ${shown.join(', ')}`
    landedName.value = player.name
    await showSpotlight(player, group.team.name, FLIP_MS)
  }
  const total = props.teams.reduce((sum, team) => sum + team.players.length, 0)
  if (revealedKeys.value.length >= total) completed.value = true
}

async function placeIfSingleTeamLeft(includeSelected) {
  const groups = unrevealedGroups()
  if (groups.length !== 1) return false
  if (!includeSelected && groups[0].team.id === selectedTeamId.value) return false
  await placeGroup(groups[0])
  return true
}

function audio() {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  if (!audioCtx) audioCtx = new Ctx()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function playTick() {
  const ctx = audio()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.value = 720
  const now = ctx.currentTime
  gain.gain.setValueAtTime(0.05, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.045)
}

function playTing() {
  const ctx = audio()
  if (!ctx) return
  const now = ctx.currentTime
  ;[523.25, 783.99].forEach((freq, index) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = now + index * 0.045
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.09, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.42)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + 0.44)
  })
}

function easeWheel(t) {
  if (t < 0.58) {
    const u = t / 0.58
    return (1 - (1 - u) * (1 - u)) * 0.84
  }
  const u = (t - 0.58) / 0.42
  return 0.84 + (1 - (1 - u) ** 3) * 0.16
}

function animateTo(next) {
  const from = rotation.value
  const sliceDeg = Math.max(slice.value, 1)
  return new Promise(resolve => {
    const start = performance.now()
    let lastBucket = Math.floor(from / sliceDeg)
    let lastTick = 0
    const step = now => {
      const t = Math.min(1, (now - start) / SPIN_MS)
      const angle = from + (next - from) * easeWheel(t)
      rotation.value = angle
      const bucket = Math.floor(angle / sliceDeg)
      if (bucket !== lastBucket && (now - lastTick > 55 || t > 0.58)) {
        playTick()
        lastTick = now
        lastBucket = bucket
      }
      if (t < 1) requestAnimationFrame(step)
      else {
        rotation.value = next
        resolve()
      }
    }
    requestAnimationFrame(step)
  })
}

async function showSpotlight(player, teamName, duration) {
  spotlight.value = { name: player.name, grade: gradeLabel(player), team: teamName }
  playTing()
  await wait(duration)
  spotlight.value = null
}

function boundaryAngle(index) {
  return index * slice.value
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
  const index = wheelPlayers.value.findIndex(item => playerKey(item) === playerKey(player))
  if (index < 0) return rotation.value
  const center = (index + 0.5) * slice.value
  const turns = 4
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
  audio()
  spinning.value = true
  spinningTurn.value = true
  await nextTick()
  await wait(40)
  if (await placeIfSingleTeamLeft(true)) {
    await finishIfComplete()
    return
  }
  for (const player of queue) {
    if (!wheelPlayers.value.some(item => playerKey(item) === playerKey(player))) continue
    spinningTurn.value = true
    await nextTick()
    await animateTo(targetRotation(player))
    landedName.value = `${player.name}${gradeLabel(player) ? ' (' + gradeLabel(player) + ')' : ''}`
    revealedKeys.value = [...revealedKeys.value, playerKey(player)]
    const total = props.teams.reduce((sum, team) => sum + team.players.length, 0)
    if (!completed.value && revealedKeys.value.length >= total) completed.value = true
    await showSpotlight(player, selectedTeam.value.name, SPOT_MS)
    spinningTurn.value = false
    await nextTick()
    wheelPlayers.value = wheelPlayers.value.filter(item => playerKey(item) !== playerKey(player))
    rotation.value = 0
    await nextTick()
    if (await placeIfSingleTeamLeft(false)) break
  }
  await finishIfComplete()
}

async function finishIfComplete() {
  spinningTurn.value = false
  spotlight.value = null
  spinning.value = false
  if (completed.value) emit('complete')
}

function close() {
  if (spinning.value) return
  emit('close')
}
</script>
