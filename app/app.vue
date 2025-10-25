<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup>
// Add Tailwind CSS
useHead({
  title: 'AOE Team Balancer',
  script: [
    {
      src: 'https://cdn.tailwindcss.com'
    }
  ]
})
</script>
