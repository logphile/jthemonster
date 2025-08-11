<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart, LineElement, PointElement, LinearScale, TimeScale, Tooltip, Filler, Legend } from 'chart.js'
import 'chartjs-adapter-date-fns'
Chart.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Filler, Legend)

const props = defineProps<{ points: Array<{ x: string; y: number; sessionId: string }>; label: string }>()
const emit = defineEmits<{ (e:'point', payload:{ sessionId:string, date:string }): void }>()
const options:any = {
  responsive: true,
  parsing: false,
  scales: { x: { type: 'time' }, y: { beginAtZero: false } },
  onClick: (_:any, els:any, chart:any) => {
    const el = els?.[0]; if(!el) return
    const idx = el.index; const p:any = chart.data.datasets[0].data[idx]
    emit('point', { sessionId: p.sessionId, date: p.x })
  }
}
// Cast to any to avoid Chart.js TS constraints on point type when using parsing:false and object points
const chartData = computed<any>(()=>({ datasets:[{ label: props.label, data: props.points, tension: 0.25, fill: false }] }))
</script>
<template><Line :data="chartData" :options="options" /></template>
