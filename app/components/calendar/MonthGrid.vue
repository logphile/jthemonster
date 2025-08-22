<script setup lang="ts">
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
const props = defineProps<{ month: Date; dayStats: Record<string, { sets: number; sessionId?: string }> }>()
const emit = defineEmits<{ (e:'select', payload:{ date: string }): void }>()
const days = computed(() => eachDayOfInterval({ start: startOfMonth(props.month), end: endOfMonth(props.month) }))
const key = (d:Date)=> d.toISOString().slice(0,10)
const intensity = (n:number)=> n===0? 'opacity-0' : n<6? 'opacity-40' : n<12? 'opacity-70':'opacity-100'
// Compute today's date in LOCAL time to avoid UTC day rollover (e.g., US evenings showing next day)
const todayIso = computed(() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})
</script>

<template>
  <div class="grid grid-cols-7 gap-1 text-xs">
    <button v-for="d in days" :key="d.toISOString()"
      type="button"
      class="aspect-square rounded-xl relative overflow-hidden flex items-start justify-start p-1 text-left transition"
      :class="[
        (props.dayStats[key(d)]?.sets ?? 0) > 0
          ? 'bg-firepink-600/15 ring-1 ring-firepink-600/50 text-white shadow-neonPink'
          : 'bg-white/5 hover:bg-white/10 text-textLo',
        key(d) === todayIso ? 'ring-2 ring-yellow-400/80 text-white' : ''
      ]"
      @click="emit('select', { date: key(d) })"
    >
      <span class="opacity-80">{{ d.getDate() }}</span>
    </button>
  </div>
</template>
