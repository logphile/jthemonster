<script setup lang="ts">
type CategoryKey = 'chestTris' | 'backBis' | 'legs' | 'shouldersAbs'

import { useQuickLog } from '~/composables/useQuickLog'
const { open } = useQuickLog()

const categories: Record<CategoryKey, string> = {
  chestTris: 'Chest / Triceps',
  backBis: 'Back / Biceps',
  legs: 'Legs',
  shouldersAbs: 'Shoulders / Abs'
}

// Popular exercises by category (extend as you wish)
const byCategory: Record<CategoryKey, Array<{ id: string; name: string }>> = {
  chestTris: [
    { id: 'bench-press', name: 'Barbell Bench Press' },
    { id: 'incline-bench', name: 'Incline Bench Press' },
    { id: 'dips', name: 'Dips' },
    { id: 'skullcrushers', name: 'Skull Crushers' },
  ],
  backBis: [
    { id: 'barbell-row', name: 'Barbell Row' },
    { id: 'lat-pulldown', name: 'Lat Pulldown' },
    { id: 'pull-ups', name: 'Pull-ups' },
    { id: 'bb-curl', name: 'Barbell Curl' },
  ],
  legs: [
    { id: 'back-squat', name: 'Back Squat' },
    { id: 'front-squat', name: 'Front Squat' },
    { id: 'rdl', name: 'Romanian Deadlift' },
    { id: 'leg-press', name: 'Leg Press' },
  ],
  shouldersAbs: [
    { id: 'ohp', name: 'Overhead Press' },
    { id: 'db-shoulder-press', name: 'DB Shoulder Press' },
    { id: 'lateral-raise', name: 'Lateral Raise' },
    { id: 'plank', name: 'Plank' },
  ],
}

const selectedCat = ref<CategoryKey>('chestTris')

const emit = defineEmits<{
  (e: 'select', payload: { category: CategoryKey; exerciseId: string; exerciseName?: string }): void
}>()

function onPick(exId: string, name: string) {
  // Emit for external listeners (optional)
  emit('select', { category: selectedCat.value, exerciseId: exId, exerciseName: name })
  // Open the global quick log sheet
  open({ category: selectedCat.value, exerciseId: exId, exerciseName: name })
}
</script>

<template>
  <section class="card">
    <header class="flex items-center justify-between mb-3">
      <h3 class="heading-white">Log Exercise</h3>
    </header>

    <!-- Category chips -->
    <div class="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      <button
        v-for="(label, key) in categories"
        :key="key"
        class="shrink-0 chip"
        :class="key === selectedCat ? 'chip-active' : ''"
        @click="selectedCat = key as CategoryKey"
      >
        {{ label }}
      </button>
    </div>

    <!-- Divider between categories and exercise list -->
    <div class="mt-3 border-t border-white/10"></div>

    <!-- Exercise list for selected category -->
    <div class="mt-3 grid grid-cols-1 gap-2">
      <button
        v-for="ex in byCategory[selectedCat]"
        :key="ex.id"
        class="w-full text-left px-3 py-2 rounded-xl bg-plum800 border border-white/10 hover:bg-white/10 text-white active:scale-[0.99] transition transform min-h-[44px]"
        @click="onPick(ex.id, ex.name)"
      >
        <span class="text-[15px]">{{ ex.name }}</span>
        <span class="ml-2 text-xs opacity-50">tap to add set</span>
      </button>
    </div>
  </section>
</template>
