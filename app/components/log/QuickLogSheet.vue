<script setup lang="ts">
import Hint from '~/components/ui/Hint.vue'
import { useQuickLog } from '~/composables/useQuickLog'
import ExerciseSelector from '~/components/log/ExerciseSelector.vue'
import { computed } from 'vue'

const { isOpen, payload, close } = useQuickLog()

function saveSet() {
  // TODO: Wire into your actual logging flow
  close()
}

const needsExercise = computed(() => !payload.value?.exerciseId)
function setExercise(id: string, name: string) {
  if (!payload.value) return
  payload.value.exerciseId = id
  payload.value.exerciseName = name
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

          <p class="text-xs opacity-70 mb-3" v-if="!needsExercise">
            {{ payload?.category }} • {{ payload?.exerciseName ?? payload?.exerciseId }}
          </p>

          <!-- If no exercise yet, show the selector INSIDE the sheet -->
          <div v-if="needsExercise" class="mt-2">
            <ExerciseSelector @select="({ category, exerciseId, exerciseName }) => setExercise(exerciseId, exerciseName || '')" />
            <p class="text-xs opacity-60 mt-2">Choose an exercise to continue.</p>
          </div>

          <!-- Otherwise show the input form -->
          <div v-else class="grid grid-cols-3 gap-2 mb-3">
            <div>
              <label class="block text-xs opacity-70 mb-1">Reps</label>
              <input
                type="number" min="1"
                class="w-full px-3 py-2 rounded-lg bg-black/40 border border-zinc-800"
                placeholder="Reps"
              >
            </div>

            <div>
              <label class="block text-xs opacity-70 mb-1">Weight (lb)</label>
              <input
                type="number" step="0.5"
                class="w-full px-3 py-2 rounded-lg bg-black/40 border border-zinc-800"
                placeholder="Weight"
              >
            </div>

            <div>
              <label class="block text-xs opacity-70 mb-1 flex items-center">
                RPE
                <Hint placement="top" widthClass="w-64">
                  RPE = Rating of Perceived Exertion. Basically, how hard was that set on a scale of 1–10.
                </Hint>
              </label>

              <input
                type="number" step="0.5" min="6" max="10"
                class="w-full px-3 py-2 rounded-lg bg-black/40 border border-zinc-800"
                placeholder="e.g. 8"
              >
            </div>
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
