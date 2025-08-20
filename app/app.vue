<template>
  <DevErrorBoundary>
    <div class="relative min-h-dvh bg-ambient grid-overlay vignette grain">
      <NuxtLayout>
        <div class="relative z-[1]">
          <NuxtPage />
        </div>
      </NuxtLayout>
      <DevDock />
    </div>
  </DevErrorBoundary>
</template>
<script setup lang="ts">
import DevErrorBoundary from '~/components/DevErrorBoundary.client.vue'
import DevDock from '~/components/DevDock.client.vue'
</script>
