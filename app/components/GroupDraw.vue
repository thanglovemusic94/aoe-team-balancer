<template>
  <section v-if="teams.length >= 2" class="mt-6 border border-amber-200 rounded-lg p-4 bg-amber-50">
    <h3 class="text-lg font-bold text-gray-800 mb-2">Chia bảng đánh</h3>
    <p class="text-sm text-gray-600 mb-3">Nhập số bảng. Nếu số team không chia hết, team lẻ được đưa vào một bảng bất kỳ.</p>
    <div class="flex flex-wrap items-center gap-2 mb-3">
      <label class="text-sm text-gray-700" for="group-count">Số bảng</label>
      <input
        id="group-count"
        v-model.number="groupCount"
        type="number"
        min="2"
        :max="teams.length"
        class="w-20 px-2 py-1 border border-gray-300 rounded text-center"
      />
      <button
        @click="draw"
        class="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg"
      >
        Chia bảng
      </button>
    </div>
    <p v-if="note" class="text-sm text-amber-800 mb-3">{{ note }}</p>
    <div v-if="groups.length" class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div v-for="group in groups" :key="group.name" class="bg-white border border-amber-200 rounded-lg p-3">
        <div class="font-bold text-gray-800 mb-2">{{ group.name }} · {{ group.teams.length }} team</div>
        <div v-for="team in group.teams" :key="team.name" class="mb-2 last:mb-0">
          <div class="flex justify-between text-sm font-semibold text-gray-800">
            <span>{{ team.name }}</span>
            <span>{{ team.totalPoints }}</span>
          </div>
          <p class="text-xs text-gray-600">{{ team.players.map(player => player.name).join(', ') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { drawGroups } from '../utils/groupDraw.js'

const props = defineProps({
  teams: { type: Array, required: true }
})

const groupCount = ref(2)
const groups = ref([])
const note = ref('')

watch(() => props.teams.map(team => team.name).join('|'), () => {
  groups.value = []
  note.value = ''
})

function draw() {
  const count = Math.min(Math.max(2, Number(groupCount.value) || 2), props.teams.length)
  groupCount.value = count
  const next = drawGroups(props.teams, count)
  groups.value = next
  const extras = next.filter(group => group.extra).map(group => group.name)
  note.value = extras.length
    ? `${props.teams.length % count} team lẻ vào ${extras.join(', ')}.`
    : `${props.teams.length} team chia đều vào ${count} bảng.`
}
</script>
