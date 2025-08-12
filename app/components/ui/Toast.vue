<script setup lang="ts">
const show = ref(false)
const msg = ref('')
function open(text: string) {
  msg.value = text
  show.value = true
  setTimeout(() => (show.value = false), 1400)
}
// expose to parent/plugin
defineExpose({ open })
</script>

<template>
  <div v-if="show" class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] px-4 py-2 rounded-xl bg-coal-800 text-white shadow-card">
    {{ msg }}
  </div>
</template>
