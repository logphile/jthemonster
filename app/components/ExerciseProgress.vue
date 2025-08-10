<script setup lang="ts">
import { Line, Bar } from 'vue-chartjs'
import {
  Chart, LineElement, PointElement, LinearScale, CategoryScale, BarElement, Tooltip, Legend, TimeSeriesScale, Filler, Title
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import 'chartjs-adapter-date-fns'
import { ref, watch } from 'vue'
import { useSets } from '../stores/sets'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, BarElement, Tooltip, Legend, TimeSeriesScale, Filler, Title, zoomPlugin)

const props = defineProps<{ exerciseId: string }>()
const setsStore = useSets()

const loading = ref(true)
const labels = ref<string[]>([])
const estData = ref<number[]>([])
const topData = ref<number[]>([])
const volData = ref<number[]>([])
const showEst = ref(true)
const showTop = ref(true)
const showVol = ref(false)

async function load() {
  loading.value = true
  const series = await setsStore.getProgressSeries(props.exerciseId)
  labels.value = series.map(s => s.date)
  estData.value = series.map(s => s.est1rm)
  topData.value = series.map(s => s.top)
  volData.value = series.map(s => s.volume)
  loading.value = false
}
watch(() => props.exerciseId, load, { immediate: true })

const options: any = {
  responsive: true,
  interaction: { mode: 'nearest', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (items: any[]) => items?.[0]?.label,
        label: (item: any) => {
          const i = item.dataIndex
          const est = estData.value[i]
          const top = topData.value[i]
          const vol = volData.value[i]
          return [
            showEst.value ? `Est 1RM: ${est?.toFixed(1)}` : null,
            showTop.value ? `Top set: ${top}` : null,
            showVol.value ? `Volume: ${vol}` : null
          ].filter(Boolean) as any
        }
      }
    },
    zoom: {
      zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
      pan: { enabled: true, mode: 'x' }
    }
  },
  scales: {
    x: { type: 'timeseries', time: { unit: 'day' } },
    y: { beginAtZero: true }
  }
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex gap-2">
      <button class="px-3 py-1 rounded border" @click="showEst = !showEst">Est 1RM</button>
      <button class="px-3 py-1 rounded border" @click="showTop = !showTop">Top Set</button>
      <button class="px-3 py-1 rounded border" @click="showVol = !showVol">Volume</button>
    </div>

    <div v-if="loading" class="text-sm opacity-70">Loading chart…</div>

    <Line v-if="!loading"
      :data="{
        labels,
        datasets: [
          ...(showEst ? [{ label:'Est 1RM', data: estData, tension: 0.25, fill: false }] : []),
          ...(showTop ? [{ label:'Top Set', data: topData, tension: 0.25, fill: false }] : []),
        ]
      }"
      :options="options"
    />
    <Bar v-if="!loading && showVol"
      :data="{ labels, datasets: [{ label: 'Volume', data: volData }] }"
      :options="{ ...options, scales: { ...options.scales, y: { beginAtZero: true } } }"
    />
  </div>
</template>
