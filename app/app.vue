<template>
  <DevErrorBoundary>
    <NuxtPage />
    <DevDock />
  </DevErrorBoundary>
</template>
<script setup lang="ts">
import DevErrorBoundary from '~/components/DevErrorBoundary.client.vue'
import DevDock from '~/components/DevDock.client.vue'
</script>
