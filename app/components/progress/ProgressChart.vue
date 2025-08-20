<script setup lang="ts">
import { Line, Bar } from 'vue-chartjs'
import { Chart, LineElement, BarElement, PointElement, LinearScale, TimeScale, Tooltip, Filler, Legend } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import 'chartjs-adapter-date-fns'
Chart.register(LineElement, BarElement, PointElement, LinearScale, TimeScale, Tooltip, Filler, Legend, zoomPlugin)

const props = withDefaults(defineProps<{
  points: Array<{ x: string; y: number; sessionId: string }>
  label: string
  type?: 'line' | 'bar'
}>(), { type: 'line' })
const emit = defineEmits<{ (e:'point', payload:{ sessionId:string, date:string }): void }>()
const baseChart = ref<any>(null)
const options:any = {
  responsive: true,
  maintainAspectRatio: false,
  parsing: { xAxisKey: 'x', yAxisKey: 'y' },
  scales: {
    x: {
      type: 'time', time: { unit: 'day' },
      grid: { color: 'rgba(255,255,255,0.08)' },
      ticks: { color: 'rgba(229,229,229,0.75)' },
    },
    y: {
      beginAtZero: false,
      grid: { color: 'rgba(255,255,255,0.08)' },
      ticks: { color: 'rgba(229,229,229,0.75)' },
    }
  },
  plugins: {
    legend: { labels: { color: 'rgba(229,229,229,0.9)' } },
    zoom: {
      pan: { enabled: true, mode: 'xy' },
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'xy'
      }
    }
  },
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
    borderWidth: 2,
    // Neon palette
    borderColor: props.type === 'bar' ? '#8B5CF6' : '#FF007A',
    backgroundColor: props.type === 'bar' ? 'rgba(139,92,246,0.45)' : 'rgba(255,0,122,0.28)',
    pointRadius: props.type === 'line' ? 3 : 0,
    pointHoverRadius: props.type === 'line' ? 4 : 0,
    pointBackgroundColor: props.type === 'line' ? '#FFD600' : undefined,
    pointBorderColor: props.type === 'line' ? '#FFD600' : undefined,
    pointHoverBackgroundColor: props.type === 'line' ? '#8B5CF6' : undefined,
    barThickness: props.type === 'bar' ? 14 : undefined,
  }]
}))

function resetZoom(){
  try { (baseChart as any)?.value?.chart?.resetZoom?.() } catch {}
}
defineExpose({ resetZoom })
</script>
<template>
  <component ref="baseChart" :is="props.type === 'bar' ? Bar : Line" :data="chartData" :options="options" class="w-full h-full" />
  
</template>
