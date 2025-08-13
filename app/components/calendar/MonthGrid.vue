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
    <div v-for="d in days" :key="d.toISOString()"
      class="aspect-square rounded-xl bg-white/5 relative overflow-hidden"
      @click="emit('select', { date: key(d) })"
    >
      <span class="absolute top-1 left-1 opacity-70">{{ d.getDate() }}</span>
      <span
        class="absolute inset-0 m-2 rounded-lg transition"
        :class="(props.dayStats[key(d)]?.sets ?? 0) > 0 ? 'bg-firepink-600/25 ring-1 ring-firepink-600' : ''"
      />
    </div>
  </div>
</template>
