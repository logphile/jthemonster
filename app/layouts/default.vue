<script setup lang="ts">
// This is the restored default layout.
// The LogSetFab and GlobalQLSheet components are wrapped in ClientOnly
// to prevent hydration errors, as they may contain browser-only APIs.
onMounted(() => console.log('[layout] default mounted'))
</script>

<template>
  <div>
    <slot />
    <ClientOnly>
      <LogSetFab />
      <GlobalQLSheet />
    </ClientOnly>
  </div>
</template>
