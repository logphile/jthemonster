<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useExercises as useExercisesStore } from '~/stores/exercises'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', payload: any): void
}>()

const exercises = useExercisesStore()

const name = ref('')
const bodypart = ref<string>('')
const equipment = ref<string>('')
const saving = ref(false)
const error = ref<string>('')

const bodypartOptions = [
  { value: '', label: 'Select body part' },
  { value: 'chest', label: 'Chest' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'back', label: 'Back' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'legs', label: 'Legs (general)' },
  { value: 'quads', label: 'Quads' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'calves', label: 'Calves' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'abs', label: 'Abs' },
  { value: 'core', label: 'Core' },
]

const equipmentOptions = [
  { value: '', label: 'Any/None' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'machine', label: 'Machine' },
  { value: 'cable', label: 'Cable' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'band', label: 'Band' },
]

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
})

function reset() {
  name.value = ''
  bodypart.value = ''
  equipment.value = ''
  error.value = ''
}

async function save() {
  error.value = ''
  const n = name.value.trim()
  const bp = bodypart.value.trim()
  if (n.length < 3) { error.value = 'Please enter a longer name.'; return }
  if (!bp) { error.value = 'Please select a body part.'; return }
  try {
    saving.value = true
    const row = await exercises.createCustom({ name: n, bodypart: bp, equipment: equipment.value || null })
    reset()
    emit('saved', row)
    emit('close')
  } catch (e: any) {
    error.value = e?.message || 'Failed to add exercise.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[10070] bg-black/70 backdrop-blur-sm" @click.self="emit('close')">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-ex-title"
        class="z-[10080] mx-auto mt-24 max-w-lg px-4"
      >
        <div class="card p-4">
          <header class="flex items-center justify-between mb-2">
            <h3 id="add-ex-title" class="heading-white">Add Custom Exercise</h3>
            <button class="btn-ghost" @click="emit('close')">Close</button>
          </header>

          <div class="space-y-3">
            <div>
              <label class="block mb-1 text-xs opacity-70 eyebrow">Name</label>
              <input
                v-model="name"
                type="text"
                class="input w-full"
                placeholder="e.g. Bulgarian Split Squat"
                autocomplete="off"
              />
            </div>

            <div>
              <label class="block mb-1 text-xs opacity-70 eyebrow">Body Part</label>
              <select v-model="bodypart" class="select w-full">
                <option v-for="opt in bodypartOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block mb-1 text-xs opacity-70 eyebrow">Equipment (optional)</label>
              <select v-model="equipment" class="select w-full">
                <option v-for="opt in equipmentOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
          </div>

          <footer class="mt-4 flex items-center justify-end gap-2">
            <button class="btn-ghost" @click="emit('close')">Cancel</button>
            <button class="btn-primary" :disabled="saving" @click="save">
              <span v-if="!saving">Save Exercise</span>
              <span v-else>Saving…</span>
            </button>
          </footer>
        </div>
      </div>
    </div>
  </Teleport>
</template>
