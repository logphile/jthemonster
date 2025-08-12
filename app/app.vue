<template>
  <NuxtLayout>
    <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
  </NuxtLayout>
  <ClientOnly>
    <GlobalQLSheet />
  </ClientOnly>
</template>

<script setup lang="ts">
const GlobalQLSheet = defineAsyncComponent(() => import('~/components/log/QuickLogSheet.vue'))
onMounted(() => console.log('[app.vue] mounted'))
</script>

<style>
.page-enter-active, .page-leave-active { transition: opacity .18s ease; }
.page-enter-from, .page-leave-to { opacity: 0; }
</style>
