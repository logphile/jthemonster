<script setup lang="ts">
import Hint from '~/components/ui/Hint.vue'
import { useQuickLog } from '~/composables/useQuickLog'
import ExercisePicker from '~/components/ExercisePicker.vue'
import { computed, watch, ref } from 'vue'
import { reactive, nextTick, onBeforeUnmount, onMounted } from 'vue'
import { useRepo } from '~/composables/useRepo'

const { isOpen, payload, close, mounted } = useQuickLog()
const { addSet } = useRepo()
const { $toast } = useNuxtApp()

const form = reactive({ reps: '', weight: '', rpe: '' })
const saving = ref(false)
const savedFlash = ref(false)

async function save(next: boolean) {
  if (!payload.value || !payload.value.exerciseId) return
  saving.value = true
  const saved = await addSet({
    exerciseId: payload.value.exerciseId,
    reps: Number(form.reps || 0),
    weightLb: Number(form.weight || 0),
    rpe: form.rpe ? Number(form.rpe) : undefined,
    date: payload.value.date,
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

// Keep payload name optionally in sync when picker changes the id
watch(() => payload.value?.exerciseId, (id) => {
  if (!payload.value) return
  // Name can be resolved by repo if needed; leave as-is for now
})

onMounted(() => { try { mounted.value = true; console.debug('[QuickLogSheet] mounted') } catch {} })
onBeforeUnmount(() => { try { mounted.value = false; console.debug('[QuickLogSheet] before unmount -> closing') } catch {} ; close() })

// Prevent immediate close caused by the original click finishing on the new backdrop
const recentlyOpened = ref(false)
watch(isOpen, (v) => {
  if (v) {
    recentlyOpened.value = true
    setTimeout(() => { recentlyOpened.value = false }, 220)
  }
})
function onBackdropClick() {
  if (recentlyOpened.value) return
  close()
}
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div
          class="sheet-overlay"
          :class="{ 'pointer-events-none': recentlyOpened }"
          @click="onBackdropClick"
        />

        <!-- Bottom sheet -->
        <div
          class="fixed inset-x-0 bottom-0 z-[60]
                 bg-card/90 border border-border/60 ring-1 ring-firepink-600/40 shadow-neonPink
                 rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur"
          @click.stop
          @mousedown.stop
          @touchstart.stop
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-base font-semibold font-hud">Log Set</h3>
            <button class="btn-secondary text-sm h-8" @click="close">Close</button>
          </div>

          <p v-if="payload?.date" class="text-xs opacity-70 mb-2">
            {{ new Date(payload.date as string).toDateString() }}
          </p>

          <p class="text-xs opacity-70 mb-3" v-if="!needsExercise">
            {{ payload?.category }} • {{ payload?.exerciseName ?? payload?.exerciseId }}
          </p>

          <!-- If no exercise yet, show the compact picker INSIDE the sheet -->
          <div v-if="needsExercise" class="mt-2 space-y-2">
            <ExercisePicker v-model="payload!.exerciseId" />
            <p class="text-xs opacity-60">Pick an exercise to continue</p>
          </div>

          <!-- Otherwise show the input form -->
          <div v-else class="grid grid-cols-3 gap-2 mb-3">
            <div>
              <label class="block text-xs opacity-70 mb-1">Reps</label>
              <input
                type="number" min="1"
                id="repsInput"
                v-model="form.reps"
                class="input"
                placeholder="Reps"
              >
            </div>

            <div>
              <label class="block text-xs opacity-70 mb-1">Weight (lb)</label>
              <input
                type="number" step="0.5"
                v-model="form.weight"
                class="input"
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
                class="input"
                placeholder="e.g. 8"
              >
            </div>
          </div>

          <!-- Actions -->
          <div v-if="!needsExercise" class="flex gap-2 mt-4">
            <button class="flex-1 btn-secondary h-10" @click="close" :disabled="saving">Cancel</button>
            <button
              class="flex-1 btn-primary h-10 whitespace-nowrap disabled:opacity-60"
              :disabled="saving"
              @click="save(true)"
            >
              <span v-if="savedFlash">Saved ✓</span>
              <span v-else-if="saving">Saving…</span>
              <span v-else>Save & Add</span>
            </button>
            <button
              class="flex-1 btn-primary h-10 whitespace-nowrap disabled:opacity-60"
              :disabled="saving"
              @click="save(false)"
            >
              Save & Close
            </button>
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
