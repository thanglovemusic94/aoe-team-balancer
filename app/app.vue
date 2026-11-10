<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<style>
.rotate-180 {
  transform: rotate(180deg);
}

.transition-transform {
  transition: transform 0.2s ease-in-out;
}

button {
  border: 1px solid #f3d7a1 !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 248, 225, 0.85),
    inset 0 -3px 0 rgba(70, 38, 6, 0.5),
    0 4px 0 #5a3410,
    0 8px 14px rgba(30, 16, 4, 0.28) !important;
  transition: transform 0.12s ease, filter 0.12s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.06);
}

button:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow:
    inset 0 3px 5px rgba(40, 20, 0, 0.45),
    0 1px 0 #5a3410 !important;
}

button:disabled {
  transform: none;
  filter: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
}

.bg-white.shadow-lg,
.bg-white.shadow-2xl,
.realm-banner,
.frame-3d {
  border: 2px solid #e7c98a !important;
  box-shadow:
    inset 0 0 0 2px #6d4a16,
    inset 0 2px 0 rgba(255, 244, 210, 0.9),
    inset 0 -4px 0 rgba(80, 46, 10, 0.3),
    0 8px 0 rgba(62, 36, 8, 0.32),
    0 16px 28px rgba(20, 10, 2, 0.32) !important;
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
