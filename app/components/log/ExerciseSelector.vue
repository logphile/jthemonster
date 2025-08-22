<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuickLog } from '~/composables/useQuickLog'
import { useExercises as useExercisesStore } from '~/stores/exercises'
import AddExerciseModal from '~/components/exercises/AddExerciseModal.vue'

type CategoryKey = '' | 'chest' | 'triceps' | 'back' | 'biceps' | 'legs' | 'shoulders' | 'abs'

const { open } = useQuickLog()
const exercises = useExercisesStore()

const showAdd = ref(false)

// Body-part chips (All + primary groups)
const categories: Array<{ value: CategoryKey; label: string }> = [
  { value: '', label: 'All' },
  { value: 'chest', label: 'Chest' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'back', label: 'Back' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'legs', label: 'Legs' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'abs', label: 'Abs' },
]

const selectedCat = ref<CategoryKey>('')
const search = ref('')
const legsParts = new Set(['legs', 'quads', 'hamstrings', 'glutes', 'calves'])

const filteredExercises = computed(() => {
  const term = search.value.trim().toLowerCase()
  return (exercises.list || [])
    .filter((e: any) => {
      if (!selectedCat.value) return true
      if (selectedCat.value === 'legs') return legsParts.has(e.bodypart)
      if (selectedCat.value === 'abs') return e.bodypart === 'abs' || e.bodypart === 'core'
      return e.bodypart === selectedCat.value
    })
    .filter((e: any) => {
      if (!term) return true
      const name = (e.name || '').toLowerCase()
      const id = (e.id || '').toLowerCase()
      return name.includes(term) || id.includes(term)
    })
    .map((e: any) => ({ id: e.id, name: e.name, bodypart: e.bodypart }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name))
})

const emit = defineEmits<{
  (e: 'select', payload: { category: CategoryKey; exerciseId: string; exerciseName?: string }): void
}>()

function onPick(exId: string, name: string) {
  // Determine category if "All" is selected by inferring from the exercise bodypart
  let category: CategoryKey = selectedCat.value
  if (!category) {
    const row = (exercises.list as any[])?.find((r: any) => r.id === exId)
    if (row) {
      if (legsParts.has(row.bodypart)) category = 'legs'
      else if (row.bodypart === 'abs' || row.bodypart === 'core') category = 'abs'
      else category = row.bodypart as CategoryKey
    }
  }
  emit('select', { category, exerciseId: exId, exerciseName: name })
  open({ category, exerciseId: exId, exerciseName: name })
}

onMounted(() => { if (!Array.isArray(exercises.list) || !(exercises.list as any[]).length) exercises.load() })
</script>

<template>
  <section class="card">
    <header class="flex items-center justify-between mb-3">
      <h2 class="heading-white">Log Exercise</h2>
      <button class="btn-primary" @click="showAdd = true">Add Exercise</button>
    </header>

    <!-- Category chips -->
    <div class="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      <button
        v-for="c in categories"
        :key="c.value"
        class="shrink-0 chip"
        :class="c.value === selectedCat ? 'chip-active' : ''"
        @click="selectedCat = c.value"
      >
        {{ c.label }}
      </button>
    </div>

    <!-- Divider between categories and search -->
    <div class="mt-3 border-t border-white/10"></div>

    <!-- Search input -->
    <div class="mt-3">
      <label class="block mb-1 text-xs opacity-70 eyebrow">Search</label>
      <input type="search" v-model="search" class="input" placeholder="Search exercises…" />
    </div>

    <!-- Exercise list for selected filters -->
    <div class="mt-3 grid grid-cols-1 gap-2">
      <button
        v-for="ex in filteredExercises"
        :key="ex.id"
        class="w-full text-left px-3 py-2 rounded-xl bg-plum800 border border-white/10 hover:bg-white/10 text-white active:scale-[0.99] transition transform min-h-[44px]"
        @click="onPick(ex.id, ex.name)"
      >
        <span class="text-[15px]">{{ ex.name }}</span>
        <span class="ml-2 text-xs opacity-50">tap to add set</span>
      </button>
      <p v-if="!filteredExercises.length" class="text-sm opacity-60">No exercises match your filters.</p>
    </div>
  </section>
  <AddExerciseModal v-if="showAdd" @close="showAdd = false" />
</template>
