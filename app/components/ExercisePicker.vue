<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useExercises as useExercisesStore } from '~/stores/exercises'

type CategoryKey = 'chest' | 'triceps' | 'back' | 'biceps' | 'legs' | 'shoulders' | 'abs'

const model = defineModel<string|null>({ default: null })
const exercises = useExercisesStore()

// UI categories requested
const categories: Array<{ value: CategoryKey; label: string }> = [
  { value: 'chest', label: 'Chest' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'back', label: 'Back' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'legs', label: 'Legs' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'abs', label: 'Abs' },
]

const selectedCategory = ref<CategoryKey | ''>('')
const legsParts = new Set(['quads', 'hamstrings', 'glutes', 'calves'])

const filteredExercises = computed(() => {
  if (!selectedCategory.value) return [] as Array<{ id:string; name:string }>
  return (exercises.list || [])
    .filter((e: any) => {
      if (selectedCategory.value === 'legs') return legsParts.has(e.bodypart)
      if (selectedCategory.value === 'abs') return e.bodypart === 'abs' || e.bodypart === 'core'
      return e.bodypart === selectedCategory.value
    })
    .map((e: any) => ({ id: e.id, name: e.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

// Reset exercise when category changes or option disappears
watch(selectedCategory, () => { model.value = null; listOpen.value = false; catOpen.value = false })
watch(filteredExercises, (opts) => {
  if (!opts.find(o => o.id === model.value)) model.value = null
})

// Inline list dropdown state for exercises
const listOpen = ref(false)
const catOpen = ref(false)
const nameById = computed(() => Object.fromEntries(filteredExercises.value.map(e => [e.id, e.name])))
const currentExerciseLabel = computed(() => model.value ? (nameById.value[model.value] ?? 'Select exercise…') : 'Select exercise…')
const currentCategoryLabel = computed(() => {
  const found = categories.find(c => c.value === selectedCategory.value)
  return found ? found.label : 'Select category…'
})
function toggleList(){ if (!selectedCategory.value) return; listOpen.value = !listOpen.value; if (listOpen.value) catOpen.value = false }
function toggleCat(){ catOpen.value = !catOpen.value; if (catOpen.value) listOpen.value = false }
function chooseExercise(id: string){ model.value = id; listOpen.value = false }
function chooseCategory(val: CategoryKey){ selectedCategory.value = val; catOpen.value = false }
function onDocClick(){ listOpen.value = false; catOpen.value = false }

onMounted(() => { exercises.load(); document.addEventListener('click', onDocClick) })
onBeforeUnmount(() => { document.removeEventListener('click', onDocClick) })
</script>

<template>
  <div class="grid gap-3">
    <div @click.stop>
      <label class="block mb-1 text-sm text-gray-400">Category</label>
      <button type="button" class="select w-full flex items-center justify-between" @click="toggleCat">
        <span>{{ currentCategoryLabel }}</span>
        <span class="ml-2 opacity-70" aria-hidden="true">▾</span>
      </button>
      <div v-if="catOpen" class="mt-2 rounded-xl bg-bg border border-border/60 max-h-60 overflow-auto">
        <button
          v-for="c in categories"
          :key="c.value"
          type="button"
          class="w-full text-left px-3 py-2 hover:bg-white/10 active:bg-white/20"
          @click="chooseCategory(c.value)"
        >
          {{ c.label }}
        </button>
      </div>
    </div>

    <div @click.stop>
      <label class="block mb-1 text-sm text-gray-400">Exercise</label>
      <button type="button" class="select w-full flex items-center justify-between" :disabled="!selectedCategory" @click="toggleList">
        <span>{{ currentExerciseLabel }}</span>
        <span class="ml-2 opacity-70" aria-hidden="true">▾</span>
      </button>
      <div v-if="listOpen && selectedCategory" class="mt-2 rounded-xl bg-bg border border-border/60 max-h-60 overflow-auto">
        <button
          v-for="e in filteredExercises"
          :key="e.id"
          type="button"
          class="w-full text-left px-3 py-2 hover:bg-white/10 active:bg-white/20"
          @click="chooseExercise(e.id)"
        >
          {{ e.name }}
        </button>
      </div>
    </div>
  </div>
</template>
