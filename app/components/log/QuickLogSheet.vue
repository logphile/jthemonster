<script setup lang="ts">
import Hint from '~/components/ui/Hint.vue'
import { useQuickLog } from '~/composables/useQuickLog'
import ExerciseSelector from '~/components/log/ExerciseSelector.vue'
import { computed } from 'vue'
import { reactive, nextTick, onBeforeUnmount } from 'vue'
import { useWorkoutStore, type Unit } from '~/stores/workout'

const { isOpen, payload, close } = useQuickLog()
const store = useWorkoutStore()
const { $toast } = useNuxtApp()

const form = reactive({ reps: '', weight: '', rpe: '', unit: 'lb' as Unit })
const saving = ref(false)
const savedFlash = ref(false)

async function save(next: boolean) {
  if (!payload.value || !payload.value.exerciseId) return
  saving.value = true
  const saved = await store.logSet({
    exerciseId: payload.value.exerciseId,
    reps: Number(form.reps || 0),
    weight: Number(form.weight || 0),
    rpe: form.rpe ? Number(form.rpe) : undefined,
    unit: form.unit,
  })
  saving.value = false
  savedFlash.value = true
  setTimeout(() => (savedFlash.value = false), 700)
  try { window.dispatchEvent?.(new CustomEvent('jt:set-saved', { detail: saved })) } catch {}
  $toast?.('Set saved ✓')
  if (next) {
    form.reps = ''
    form.weight = ''
    await nextTick()
    const el = document.getElementById('repsInput') as HTMLInputElement | null
    el?.focus()
  } else {
    close()
  }
}

const needsExercise = computed(() => !payload.value?.exerciseId)
function setExercise(id: string, name: string) {
  if (!payload.value) return
  payload.value.exerciseId = id
  payload.value.exerciseName = name
}

onBeforeUnmount(() => close())
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-[55]" @click="close" />

        <!-- Bottom sheet -->
        <div
          class="fixed inset-x-0 bottom-0 z-[60]
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
                id="repsInput"
                v-model="form.reps"
                class="w-full px-3 py-2 rounded-lg bg-black/40 border border-zinc-800"
                placeholder="Reps"
              >
            </div>

            <div>
              <label class="block text-xs opacity-70 mb-1">Weight ({{ form.unit }})</label>
              <input
                type="number" step="0.5"
                v-model="form.weight"
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
                v-model="form.rpe"
                class="w-full px-3 py-2 rounded-lg bg-black/40 border border-zinc-800"
                placeholder="e.g. 8"
              >
            </div>
          </div>

          <!-- Unit selector + actions -->
          <div v-if="!needsExercise" class="flex items-center justify-between mt-2 mb-1">
            <select v-model="form.unit" class="bg-zinc-800 border border-zinc-700 rounded-lg h-9 px-2 text-sm">
              <option value="lb">lb</option>
              <option value="kg">kg</option>
            </select>
            <div class="flex gap-2">
              <button class="px-4 h-9 rounded-lg bg-zinc-800 border border-zinc-700" @click="close" :disabled="saving">Cancel</button>
              <button class="px-4 h-9 rounded-lg bg-rose-600 text-white disabled:opacity-60" :disabled="saving" @click="save(true)">
                <span v-if="savedFlash">Saved ✓</span>
                <span v-else-if="saving">Saving…</span>
                <span v-else>Save & Add</span>
              </button>
              <button class="px-4 h-9 rounded-lg bg-rose-600 text-white disabled:opacity-60" :disabled="saving" @click="save(false)">
                <span v-if="savedFlash">Saved ✓</span>
                <span v-else-if="saving">Saving…</span>
                <span v-else>Save & Close</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
