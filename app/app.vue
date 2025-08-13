<template>
  <NuxtLayout>
    <ClientOnly>
      <NuxtErrorBoundary>
        <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
        <template #error="{ error }">
          <div class="p-6 text-red-300">Oops! {{ error?.message || 'Something went wrong.' }}</div>
        </template>
      </NuxtErrorBoundary>
      <GlobalLogSetFab />
      <GlobalQLSheet />
    </ClientOnly>
  </NuxtLayout>
</template>

<script setup lang="ts">
const GlobalQLSheet = defineAsyncComponent(() => import('~/components/log/QuickLogSheet.vue'))
const GlobalLogSetFab = defineAsyncComponent(() => import('~/components/log/LogSetFab.vue'))
onMounted(() => console.log('[app.vue] mounted'))
</script>

<style>
.page-enter-active, .page-leave-active { transition: opacity .18s ease; }
.page-enter-from, .page-leave-to { opacity: 0; }
</style>
