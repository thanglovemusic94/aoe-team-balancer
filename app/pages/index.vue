<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          🎮 AOE Team Balancer
        </h1>
        <p class="text-lg text-gray-600">
          Công cụ chia team cân bằng ngẫu nhiên cho Age of Empires
        </p>
      </header>
      
      <main>
        <!-- Manual Input -->
        <PlayerInput @players-submitted="handlePlayersInput" />
        
        <PlayerList v-if="players.length > 0" :players="players" @update-players="handlePlayersUpdate" />
        <TeamBalancer 
          v-if="players.length === 28" 
          :key="regenerateKey"
          :players="players"
          :existing-teams="teams"
          @teams-generated="handleTeamsGenerated"
        />
        <TeamResults v-if="teams.length > 0" :teams="teams" @regenerate="handleRegenerate" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// Add Tailwind CSS
useHead({
  title: 'AOE Team Balancer',
  script: [
    {
      src: 'https://cdn.tailwindcss.com'
    }
  ]
})

const players = ref([])
const teams = ref([])
const regenerateKey = ref(0)

// Load data from localStorage on mount
onMounted(() => {
  if (process.client) {
    const savedPlayers = localStorage.getItem('aoe_players')
    const savedTeams = localStorage.getItem('aoe_teams')
    
    if (savedPlayers) {
      try {
        players.value = JSON.parse(savedPlayers)
        console.log('✅ Loaded players from localStorage')
      } catch (e) {
        console.error('Error loading players:', e)
      }
    }
    
    if (savedTeams) {
      try {
        teams.value = JSON.parse(savedTeams)
        console.log('✅ Loaded teams from localStorage')
      } catch (e) {
        console.error('Error loading teams:', e)
      }
    }
  }
})

// Save players to localStorage whenever it changes
watch(players, (newPlayers) => {
  if (process.client && newPlayers.length > 0) {
    localStorage.setItem('aoe_players', JSON.stringify(newPlayers))
    console.log('💾 Saved players to localStorage')
  }
}, { deep: true })

// Save teams to localStorage whenever it changes
watch(teams, (newTeams) => {
  if (process.client && newTeams.length > 0) {
    localStorage.setItem('aoe_teams', JSON.stringify(newTeams))
    console.log('💾 Saved teams to localStorage')
  }
}, { deep: true })

const handlePlayersInput = (inputPlayers) => {
  players.value = inputPlayers
  teams.value = []
}

const handlePlayersUpdate = (updatedPlayers) => {
  players.value = updatedPlayers
  teams.value = []
}

const handleTeamsGenerated = (generatedTeams) => {
  teams.value = generatedTeams
}

const handleRegenerate = () => {
  // Clear teams and increment key to force component re-render
  teams.value = []
  // Save empty teams to localStorage
  if (process.client) {
    localStorage.setItem('aoe_teams', JSON.stringify([]))
    console.log('🗑️ Cleared teams in localStorage')
  }
  regenerateKey.value++
}
</script>
