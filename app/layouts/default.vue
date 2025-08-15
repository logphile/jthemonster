<script setup lang="ts">
onMounted(() => console.log('[layout] default mounted'))
</script>

<template>
  <!-- zero slots/props, nothing fancy -->
  <main class="p-4">
    <NuxtPage />
  </main>
</template>
