<template>
  <transition name="fade">
    <div v-if="open" class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
      rounded-xl bg-card border border-border/60 px-4 py-2 text-sm">
      {{ msg }}
    </div>
  </transition>
</template>

<script setup lang="ts">
const open = ref(false)
const msg = ref('')
let t: any
function show(m: string) {
  msg.value = m; open.value = true
  clearTimeout(t); t = setTimeout(() => open.value = false, 1600)
}
defineExpose({ show })
</script>

<style>
.fade-enter-active,.fade-leave-active{transition:opacity .18s}
.fade-enter-from,.fade-leave-to{opacity:0}
</style>
