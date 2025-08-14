<template>
  <div class="min-h-dvh">
    <header v-if="route.path !== '/'" class="sticky top-0 z-20 border-b border-border/60 bg-bg/80 backdrop-blur">
      <div class="mx-auto max-w-screen-md px-4 py-3 flex items-center justify-between">
        <h1 class="font-display text-xl tracking-wide">
          <span class="text-primary">J</span> The Monster
        </h1>
        <NuxtLink to="/settings" class="rounded-full border border-border/60 px-3 py-1 text-sm text-subtext hover:text-text">
          Settings
        </NuxtLink>
      </div>
    </header>

    <main class="mx-auto max-w-screen-md px-4 py-4">
      <slot />
    </main>
    <ClientOnly>
      <LogSetFab v-if="showFab" />
      <GlobalQLSheet />
    </ClientOnly>
  </div>
  
 </template>

<script setup lang="ts">
const route = useRoute()
const showFab = computed(() => route.path === '/dashboard')
const LogSetFab = defineAsyncComponent(() => import('~/components/log/LogSetFab.vue'))
const GlobalQLSheet = defineAsyncComponent(() => import('~/components/log/QuickLogSheet.vue'))
</script>
