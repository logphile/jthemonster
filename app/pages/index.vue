<template>
  <div class="p-4 space-y-4">
    <StatsCards />
    <div class="flex gap-3">
      <NuxtLink class="btn" to="/log">Log Workout</NuxtLink>
      <NuxtLink class="btn" to="/progress">Progress</NuxtLink>
      <NuxtLink class="btn" to="/exercises">Exercises</NuxtLink>
      <NuxtLink class="btn" to="/settings">Settings</NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'Dashboard • J The Monster' })
</script>
<style scoped>
.btn{ @apply px-4 py-2 rounded bg-gray-800 hover:bg-gray-700; }
</style>
