<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
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
const inputEl = ref<HTMLInputElement | null>(null)

// ---- typeahead state ----
const showSug = ref(false)
const active = ref(0)
const MAX = 8

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s]/g, '').trim()

// simple scoring: prefix > word-boundary > contains; +0.5 if same body part
function score(name: string, q: string, samePart: boolean) {
  const n = norm(name), k = norm(q)
  if (!k) return -1
  let s = -1
  if (n.startsWith(k)) s = 3
  else if (n.split(/\s+/).some(w => w.startsWith(k))) s = 2
  else if (n.includes(k)) s = 1
  if (samePart) s += 0.5
  return s
}

const suggestions = computed(() => {
  const q = name.value
  if (!q) return [] as any[]
  const items = (exercises.list || [])
    .map((e: any) => ({ e, sc: score(String(e.name || ''), q, String(e.bodypart || '') === bodypart.value) }))
    .filter(x => x.sc > 0)
    .sort((a, b) => (b.sc - a.sc) || String(a.e.name || '').localeCompare(String(b.e.name || '')))
    .slice(0, MAX)
    .map(x => x.e)

  // de-dup identical names in different parts: prefer first occurrence
  const seen = new Set<string>()
  const out: any[] = []
  for (const it of items) {
    const key = norm(String(it.name || ''))
    if (seen.has(key)) continue
    seen.add(key); out.push(it)
  }
  return out
})

// is there an exact duplicate in the chosen body part?
const dupInPart = computed(() =>
  (exercises.list || []).some((e: any) => String(e.bodypart || '') === bodypart.value && norm(String(e.name || '')) === norm(name.value))
)

function pickSuggestion(s: { name: string; bodypart?: string; equipment?: string | null }) {
  name.value = s.name
  if (s.bodypart) bodypart.value = s.bodypart
  if (s.equipment) equipment.value = s.equipment || ''
  showSug.value = false
  nextTick(() => inputEl.value?.focus())
}

// keyboard control for the list
function onKeyDown(e: KeyboardEvent) {
  // Close suggestions first on Escape, don't close the modal
  if (e.key === 'Escape' && showSug.value) {
    e.preventDefault();
    e.stopPropagation();
    showSug.value = false;
    return;
  }
  // Open suggestions on typing/navigation (except Tab/Enter/Escape)
  if (!showSug.value && suggestions.value.length && !['Tab','Enter','Escape'].includes(e.key)) {
    showSug.value = true
  }
  if (!suggestions.value.length) return
  if (e.key === 'ArrowDown') { e.preventDefault(); active.value = (active.value + 1) % suggestions.value.length }
  if (e.key === 'ArrowUp')   { e.preventDefault(); active.value = (active.value - 1 + suggestions.value.length) % suggestions.value.length }
  if (e.key === 'Enter') {
    if (suggestions.value[active.value]) { e.preventDefault(); pickSuggestion(suggestions.value[active.value]) }
  }
}

const canSave = computed(() => name.value.trim().length >= 3 && !!bodypart.value && !dupInPart.value)

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
  if (!canSave.value) {
    error.value = dupInPart.value
      ? 'That exercise already exists for this body part.'
      : (!bp ? 'Please select a body part.' : 'Please enter a longer name.')
    return
  }
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

// highlight helper for v-html
function highlight(text: string, q: string) {
  if (!q) return text
  const k = norm(q)
  const ntext = norm(text)
  const idx = ntext.indexOf(k)
  if (idx < 0) return text
  // rebuild preserving original casing by slicing using length of q at the same index in original text
  const start = text.slice(0, idx)
  const mid = text.slice(idx, idx + q.length)
  const end = text.slice(idx + q.length)
  return `${start}<span class="mark">${mid}</span>${end}`
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
            <!-- Name with typeahead -->
            <div class="relative">
              <label class="block mb-1 text-xs opacity-70 eyebrow">Name</label>
              <input
                ref="inputEl"
                v-model="name"
                type="text"
                class="input w-full"
                placeholder="e.g. Landmine Row"
                autocomplete="off"
                @focus="showSug = !!suggestions.length"
                @input="active = 0; showSug = !!suggestions.length"
                @keydown="onKeyDown"
                aria-autocomplete="list"
                :aria-expanded="showSug"
                aria-controls="ex-suggest"
              />

              <!-- suggestions popover -->
              <div v-if="showSug && suggestions.length" id="ex-suggest" role="listbox" class="popover">
                <div
                  v-for="(s, i) in suggestions" :key="s.id"
                  :class="['opt', i === active && 'opt-active']"
                  role="option" :aria-selected="i===active"
                  @mousedown.prevent="pickSuggestion(s)"
                  @mousemove="active = i"
                >
                  <div v-html="highlight(s.name, name)"></div>
                  <span v-if="s.bodypart && s.bodypart !== bodypart" class="opt-note capitalize">{{ s.bodypart }}</span>
                </div>
                <div class="px-3 py-2 text-xs text-white/70 border-t border-white/10">
                  Press <span class="mark">Enter</span> to select • <span class="mark">Esc</span> to close
                  <span v-if="dupInPart" class="text-red-300"> (duplicate in {{ bodypart || 'this part' }})</span>
                </div>
              </div>
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
            <button class="btn-primary" :disabled="saving || !canSave" @click="save">
              <span v-if="!saving">Save Exercise</span>
              <span v-else>Saving…</span>
            </button>
          </footer>
        </div>
      </div>
    </div>
  </Teleport>
</template>
