<template>
  <DevErrorBoundary>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <DevDock />
  </DevErrorBoundary>
</template>

<script setup lang="ts">
import DevErrorBoundary from '~/components/DevErrorBoundary.client.vue'
import DevDock from '~/components/DevDock.client.vue'

onMounted(() => console.log('[app.vue] mounted'))
</script>

<style>
.page-enter-active, .page-leave-active { transition: opacity .18s ease; }
.page-enter-from, .page-leave-to { opacity: 0; }
</style>
