<script setup lang="ts">
import { useQuickLog } from '~/composables/useQuickLog'

const { isOpen, payload, close } = useQuickLog()

function saveSet() {
  // TODO: Wire into your actual logging flow
  close()
}
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[1000]">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-[1000]" @click="close" />

        <!-- Bottom sheet -->
        <div
          class="fixed inset-x-0 bottom-0 z-[1001]
                 bg-zinc-900 border-t border-zinc-800
                 rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))]
                 shadow-2xl"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-base font-semibold">Log Set</h3>
            <button
              class="text-sm px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700"
              @click="close"
            >
              Close
            </button>
          </div>

          <p class="text-xs opacity-70 mb-3">
            {{ payload?.category }} • {{ payload?.exerciseName ?? payload?.exerciseId }}
          </p>

          <!-- Replace with your real form/inputs -->
          <div class="grid grid-cols-3 gap-2 mb-3">
            <input type="number" min="1" placeholder="Reps" class="px-3 py-2 rounded-lg bg-black/40 border border-zinc-800" />
            <input type="number" step="0.5" placeholder="Weight (lb)" class="px-3 py-2 rounded-lg bg-black/40 border border-zinc-800" />
            <input type="number" step="0.5" placeholder="RPE" class="px-3 py-2 rounded-lg bg-black/40 border border-zinc-800" />
          </div>

          <button class="w-full py-2 rounded-xl bg-rose-600 text-white" @click="saveSet">
            Save Set
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
