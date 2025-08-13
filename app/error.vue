<template>
  <div class="min-h-dvh grid place-items-center text-center p-6">
    <div>
      <h1 class="text-2xl font-bold mb-2">Something went wrong</h1>
      <p class="opacity-70 mb-4">{{ error?.message || 'Unknown error' }}</p>
      <button class="px-3 py-2 rounded bg-pink-600 text-white" @click="handleError">Reload</button>
    </div>
  </div>
</template>
<script setup lang="ts">
const error = useError()
const handleError = () => clearError({ redirect: '/' })
</script>
