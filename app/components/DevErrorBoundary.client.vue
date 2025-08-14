<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
const err = ref<unknown>(null)
onErrorCaptured((e) => { err.value = e; return false })
</script>

<template>
  <slot />
  <div v-if="err" class="fixed bottom-2 left-2 z-[9999] max-w-sm rounded bg-black/80 p-3 text-xs text-white">
    <strong>Render error:</strong>
    <pre class="whitespace-pre-wrap">{{ String(err) }}</pre>
  </div>
</template>
