<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Background lives behind via z-[-10] and no pointer events -->
    <div class="pointer-events-none absolute inset-0 -z-10 animate-bg-pan"></div>

    <main class="grid min-h-screen place-items-center px-6">
      <div class="w-full max-w-sm text-center">
        <h1 class="font-display text-3xl mb-6">
          <span class="text-primary">J</span> The Monster
        </h1>
        <PrimaryButton class="text-lg py-4 rounded-2xl" @click="go">
          LET'S GOOOO!
        </PrimaryButton>
        <p class="mt-3 text-subtext text-xs">Tap to start your session</p>
      </div>
    </main>
  </div>
  
</template>

<script setup lang="ts">
const KEY = 'jt_welcome_v1'
const go = async () => {
  try { localStorage.setItem(KEY, '1') } catch {}
  await navigateTo('/')
}
</script>
