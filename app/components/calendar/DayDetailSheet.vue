<script setup lang="ts">
import { useQuickLog } from '~/composables/useQuickLog'
const props = defineProps<{ date: string; sessions: Array<any>; sets: Array<{exercise:string; weight:number; reps:number; ts:number}> }>()
const emit = defineEmits<{ (e:'close'):void; (e:'addSet'):void; (e:'editSession'):void }>()
const { open } = useQuickLog()
function onAddSet(){
  // Open the global quick log with the selected date; exercise will be chosen in-sheet
  open({ category: 'chestTris', exerciseId: '', date: props.date })
}
</script>

<template>
  <div class="fixed inset-0 z-40 grid place-items-end sm:place-items-center">
    <div class="absolute inset-0 bg-black/60" @click="emit('close')"></div>
    <div class="relative z-10 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border/60 p-4 backdrop-blur">
      <div class="mx-auto h-1 w-10 rounded-full bg-white/20 mb-3" />
      <header class="mb-3">
        <h3 class="font-display text-lg">{{ new Date(props.date).toDateString() }}</h3>
      </header>
      <section class="space-y-2 max-h-[60vh] overflow-auto">
        <div v-if="!props.sets?.length" class="text-sm text-subtext">No sets logged.</div>
        <div v-for="(s,i) in props.sets" :key="i" class="flex items-center justify-between rounded-xl border border-border/60 p-2">
          <div>
            <p class="text-sm">{{ s.exercise }}</p>
            <p class="text-xs text-subtext">{{ s.weight }} × {{ s.reps }}</p>
          </div>
        </div>
      </section>
      <div class="mt-4 flex gap-2">
        <button class="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-firepink-600 to-firepink-700" @click="onAddSet">Add set</button>
        <button class="rounded-xl px-4 py-2 bg-white/10 text-sm" @click="emit('editSession')">Edit session</button>
      </div>
    </div>
  </div>
</template>
