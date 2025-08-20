<script setup lang="ts">
import { Line, Bar } from 'vue-chartjs'
import { Chart, LineElement, BarElement, PointElement, LinearScale, TimeScale, Tooltip, Filler, Legend } from 'chart.js'
import 'chartjs-adapter-date-fns'
Chart.register(LineElement, BarElement, PointElement, LinearScale, TimeScale, Tooltip, Filler, Legend)

const props = withDefaults(defineProps<{
  points: Array<{ x: string; y: number; sessionId: string }>
  label: string
  type?: 'line' | 'bar'
}>(), { type: 'line' })
const emit = defineEmits<{ (e:'point', payload:{ sessionId:string, date:string }): void }>()
const options:any = {
  responsive: true,
  parsing: false,
  scales: { x: { type: 'time', time: { unit: 'day' } }, y: { beginAtZero: false } },
  onClick: (_:any, els:any, chart:any) => {
    const el = els?.[0]; if(!el) return
    const idx = el.index; const p:any = chart.data.datasets[0].data[idx]
    emit('point', { sessionId: p.sessionId, date: p.x })
  }
}
// Cast to any to avoid Chart.js TS constraints on point type when using parsing:false and object points
const chartData = computed<any>(()=>({
  datasets:[{
    label: props.label,
    data: props.points,
    tension: props.type === 'line' ? 0.25 : undefined,
    fill: false,
    borderRadius: props.type === 'bar' ? 3 : undefined,
  }]
}))
</script>
<template>
  <component :is="props.type === 'bar' ? Bar : Line" :data="chartData" :options="options" />
  
</template>
