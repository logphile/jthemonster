<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
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
watch(selectedCategory, () => { model.value = null })
watch(filteredExercises, (opts) => {
  if (!opts.find(o => o.id === model.value)) model.value = null
})

onMounted(() => { exercises.load() })
</script>

<template>
  <div class="grid gap-3">
    <div>
      <label class="block mb-1 text-sm text-gray-400">Category</label>
      <select v-model="selectedCategory" class="w-full p-3 rounded bg-gray-800 border border-white/10">
        <option :value="''">Select category…</option>
        <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
      </select>
    </div>

    <div>
      <label class="block mb-1 text-sm text-gray-400">Exercise</label>
      <select v-model="model" class="w-full p-3 rounded bg-gray-800 border border-white/10" :disabled="!selectedCategory">
        <option :value="null">Select exercise…</option>
        <option v-for="e in filteredExercises" :key="e.id" :value="e.id">{{ e.name }}</option>
      </select>
    </div>
  </div>
</template>
