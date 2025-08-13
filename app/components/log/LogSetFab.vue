<script setup lang="ts">
import { useQuickLog } from '~/composables/useQuickLog'

const { isOpen, open } = useQuickLog()

function onClick() {
  // Open the sheet with no preset exercise. The sheet will guide the user.
  open({ category: 'chestTris', exerciseId: '', exerciseName: '' })
}
</script>

<template>
  <Teleport to="body">
    <!-- Hide FAB while the sheet is open -->
    <button
      v-show="!isOpen"
      @click="onClick"
      class="fab rounded-full px-5 py-3 text-sm font-semibold active:scale-[0.98] transition"
    >
      Log Set
    </button>
  </Teleport>
</template>
