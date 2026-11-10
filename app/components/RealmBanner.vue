<template>
  <section class="realm-banner relative overflow-hidden rounded-2xl border border-amber-900/70 shadow-2xl h-72 sm:h-80">
    <img
      src="/aoe-castle-dawn.jpg"
      alt="Lâu đài đá lúc bình minh, kỵ binh đi trên đường đồi"
      class="realm-drift absolute inset-0 h-full w-full object-cover"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10"></div>
    <div class="realm-light absolute inset-y-0 w-1/3"></div>
    <img
      src="/aoe-eagle-shield.jpg"
      alt="Khiên đại bàng đồng"
      class="absolute left-4 top-4 h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-amber-300 object-cover shadow-lg"
    />
    <div class="absolute inset-x-0 bottom-14 px-5 sm:px-8 text-center">
      <h1 class="realm-title text-3xl sm:text-5xl font-extrabold text-amber-50 drop-shadow">AOE Team Balancer</h1>
      <p class="mt-2 text-sm sm:text-lg text-amber-100/90">Chia team cân bằng cho Age of Empires</p>
    </div>
    <div class="absolute inset-x-0 bottom-0 h-14 overflow-hidden">
      <div class="realm-march flex w-[200%]">
        <div v-for="copy in 2" :key="copy" class="flex w-1/2 justify-around">
          <svg v-for="index in 6" :key="copy + '-' + index" viewBox="0 0 120 64" class="h-14 w-24 opacity-80">
            <circle cx="48" cy="16" r="5" fill="#1c140c" />
            <path d="M43 21h14l3 14H40z" fill="#1c140c" />
            <ellipse cx="66" cy="40" rx="28" ry="11" fill="#1c140c" />
            <path d="M88 34c10-4 16-14 18-20-6 6-12 14-18 18z" fill="#1c140c" />
            <path d="M42 36c-10-2-16-12-20-20 6 8 12 16 18 18z" fill="#1c140c" />
            <rect x="48" y="46" width="4" height="14" fill="#1c140c" />
            <rect x="60" y="46" width="4" height="14" fill="#1c140c" />
            <rect x="76" y="46" width="4" height="14" fill="#1c140c" />
            <rect x="88" y="46" width="4" height="14" fill="#1c140c" />
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.realm-title { font-family: Cinzel, Georgia, serif; }
.realm-drift { animation: realm-drift 28s ease-in-out infinite alternate; }
.realm-light {
  background: linear-gradient(100deg, transparent, rgba(255, 214, 120, 0.28), transparent);
  animation: realm-light 7s ease-in-out infinite;
}
.realm-march { animation: realm-march 22s linear infinite; }
@keyframes realm-drift {
  from { transform: scale(1) translate3d(0, 0, 0); }
  to { transform: scale(1.08) translate3d(-1.5%, -1%, 0); }
}
@keyframes realm-light {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(420%); }
}
@keyframes realm-march {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .realm-drift, .realm-light, .realm-march { animation: none; }
}
</style>
