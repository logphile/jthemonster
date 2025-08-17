<script setup lang="ts">
// This is the restored default layout.
// The LogSetFab and GlobalQLSheet components are wrapped in ClientOnly
// to prevent hydration errors, as they may contain browser-only APIs.
onMounted(() => console.log('[layout] default mounted'))
</script>

<template>
  <div class="min-h-screen min-h-dvh bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 text-text font-sans antialiased">
    <slot />
    <ClientOnly>
      <LogSetFab />
      <GlobalQLSheet />
    </ClientOnly>
  </div>
</template>
