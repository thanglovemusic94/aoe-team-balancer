<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<style>
/* Animation cho dropdown */
.rotate-180 {
  transform: rotate(180deg);
}

/* Transition mượt mà cho dropdown */
.transition-transform {
  transition: transform 0.2s ease-in-out;
}
</style>

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
