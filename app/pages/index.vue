<template>
  <div class="space-y-4">
    <div class="rounded-2xl bg-card border border-border/60 p-4">
      <h2 class="font-display text-xl">Dashboard</h2>
      <p class="text-subtext text-sm">If you can read this, the layout is good.</p>
    </div>

    <ClientOnly>
      <MiniVolumeChart />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
</script>
