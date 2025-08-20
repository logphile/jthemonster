<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useQuickLog } from '~/composables/useQuickLog'

const { isOpen, open } = useQuickLog()
const weightOpen = ref(false)

function onClick() {
  // Open the sheet with no preset exercise. The sheet will guide the user.
  open({ category: 'chestTris', exerciseId: '', exerciseName: '' })
}

function onWeightEvent(e: Event) {
  try { weightOpen.value = Boolean((e as CustomEvent).detail) } catch {}
}

onMounted(() => {
  try { window.addEventListener('jt:weight-open', onWeightEvent as any) } catch {}
})
onBeforeUnmount(() => {
  try { window.removeEventListener('jt:weight-open', onWeightEvent as any) } catch {}
})
</script>

<template>
  <Teleport to="body">
    <!-- Hide FAB while the sheet or weight modal is open -->
    <button
      v-show="!isOpen && !weightOpen"
      @click="onClick"
      class="fab rounded-full px-5 py-3 text-sm font-semibold active:scale-[0.98] transition"
    >
      Log Set
    </button>
  </Teleport>
</template>
