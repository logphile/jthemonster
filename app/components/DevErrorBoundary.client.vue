<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
const err = ref<unknown>(null)
const info = ref<string>('')

onErrorCaptured((e, instance, i) => { err.value = e; info.value = String(i || ''); return false })
</script>

<template>
  <slot />
  <div v-if="err" class="fixed bottom-2 left-2 z-[9999] max-w-sm rounded bg-black/80 p-3 text-xs text-white">
    <strong>Render error</strong>
    <div class="mt-1 opacity-80">Info: {{ info }}</div>
    <pre class="mt-1 whitespace-pre-wrap">{{ String(err) }}</pre>
  </div>
</template>
