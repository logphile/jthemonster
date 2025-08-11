<template>
  <div class="relative min-h-dvh overflow-hidden">
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

    <!-- Content -->
    <div class="relative z-10 grid min-h-dvh place-items-center px-6 text-center">
      <div class="w-full max-w-sm">
        <h1 class="font-display text-3xl mb-6">
          <span class="text-primary">J</span> The Monster
        </h1>
        <PrimaryButton class="text-lg py-4 rounded-2xl" @click="go">
          LET'S GOOOO!
        </PrimaryButton>
        <p class="mt-3 text-subtext text-xs">Tap to start your session</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const KEY = 'jt_welcome_v1'
const go = async () => {
  try { localStorage.setItem(KEY, '1') } catch {}
  await navigateTo('/')
}
</script>
