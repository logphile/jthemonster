<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

const err = ref<unknown>(null)
const info = ref(''), comp = ref(''), tree = ref(''),
      props = ref<any>(null), slots = ref<any>(null), keys = ref<string[]>([])

onErrorCaptured((e, inst: any, i) => {
  comp.value = inst?.type?.name || inst?.type?.__name || inst?.type?.__file || 'Anonymous'
  info.value = String(i || '')
  const chain:string[]=[]; let cur = inst
  while (cur) { chain.push(cur?.type?.name || cur?.type?.__file || 'Anonymous'); cur = cur?.parent }
  tree.value = chain.reverse().join(' > ')
  props.value = inst?.props ?? null
  slots.value = inst?.slots ? Object.keys(inst.slots) : inst?.slots
  keys.value = inst?.setupState ? Object.keys(inst.setupState) : []
  err.value = e
  return false
})
</script>

<template>
  <slot />
  <div v-if="import.meta.env.VITE_DEBUG_TOOLS === '1' && err" class="fixed left-2 bottom-2 z-[9999] max-w-xl rounded bg-black/80 p-3 text-xs text-white">
    <strong>Render error</strong>
    <div class="mt-1">component: <code>{{ comp }}</code></div>
    <div class="mt-1">tree: <code class="break-all">{{ tree }}</code></div>
    <div class="mt-1">info: <code>{{ info }}</code></div>
    <div class="mt-1">setupState keys: <code>{{ keys.join(', ') }}</code></div>
    <div class="mt-1">slots: <code>{{ slots }}</code></div>
    <div class="mt-1">props: <code class="break-all">{{ props }}</code></div>
    <pre class="mt-1 whitespace-pre-wrap">{{ String(err) }}</pre>
  </div>
</template>
