<script setup lang="ts">
const user = useSupabaseUser()
const go = () => navigateTo(user.value ? '/dashboard' : '/settings')
</script>

<template>
  <div
    class="relative min-h-dvh overflow-hidden"
    @click="go"
    role="button"
    aria-label="Start session"
  >
    <!-- Background image -->
    <img
      src="/home-hero.jpg"
      alt=""
      class="absolute inset-0 w-full h-full object-cover"
      decoding="async"
      fetchpriority="high"
    />

    <!-- Dark overlay -->
    <div class="absolute inset-0 bg-black/55"></div>

    <!-- Foreground content (keep clicks enabled) -->
    <div class="relative z-10 pointer-events-none flex min-h-dvh items-center justify-center text-center text-white">
      <div class="pointer-events-none">
        <h1 class="text-3xl font-bold tracking-tight">J The Monster</h1>
        <p class="mt-4 text-sm opacity-80">LET’S GOOOO!</p>
        <p class="mt-1 text-xs opacity-60">Tap to start your session</p>
      </div>
    </div>
  </div>
</template>
