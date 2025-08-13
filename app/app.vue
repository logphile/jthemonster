<template>
  <NuxtLayout>
    <ClientOnly>
      <NuxtErrorBoundary>
        <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
        <template #error="{ error }">
          <div class="p-6 text-red-300">Oops! {{ error?.message || 'Something went wrong.' }}</div>
        </template>
      </NuxtErrorBoundary>
      <GlobalQLSheet />
    </ClientOnly>
  </NuxtLayout>
</template>

<script setup lang="ts">
const GlobalQLSheet = defineAsyncComponent(() => import('~/components/log/QuickLogSheet.vue'))
onMounted(async () => {
  console.log('[app.vue] mounted')
  try {
    const mod = await import('~/composables/useDb')
    const fn = (mod as any)?.useDbSafe as undefined | (() => Promise<any>)
    if (fn) await fn()
  } catch (e) {
    // ignore, error boundary plugin will surface if needed
  }
})
</script>

<style>
.page-enter-active, .page-leave-active { transition: opacity .18s ease; }
.page-enter-from, .page-leave-to { opacity: 0; }
</style>
