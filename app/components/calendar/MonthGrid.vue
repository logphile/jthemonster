<script setup lang="ts">
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
const props = defineProps<{ month: Date; dayStats: Record<string, { sets: number; sessionId?: string }> }>()
const emit = defineEmits<{ (e:'select', payload:{ date: string }): void }>()
const days = computed(() => eachDayOfInterval({ start: startOfMonth(props.month), end: endOfMonth(props.month) }))
const key = (d:Date)=> d.toISOString().slice(0,10)
const intensity = (n:number)=> n===0? 'opacity-0' : n<6? 'opacity-40' : n<12? 'opacity-70':'opacity-100'
</script>

<template>
  <div class="grid grid-cols-7 gap-1 text-xs">
    <button v-for="d in days" :key="d.toISOString()"
      type="button"
      class="aspect-square rounded-xl relative overflow-hidden flex items-start justify-start p-1 text-left transition"
      :class="(props.dayStats[key(d)]?.sets ?? 0) > 0
        ? 'bg-firepink-600/20 ring-1 ring-firepink-600 text-white'
        : 'bg-white/5 hover:bg-white/7'
      "
      @click="emit('select', { date: key(d) })"
    >
      <span class="opacity-80">{{ d.getDate() }}</span>
    </button>
  </div>
</template>
