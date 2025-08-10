<template>
  <Card>
    <div class="p-4">
      <h3 class="font-display text-lg mb-2">Weekly Volume</h3>
      <canvas ref="el" class="h-36 w-full"></canvas>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale } from 'chart.js'
import 'chartjs-adapter-date-fns'
Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale)

const el = ref<HTMLCanvasElement|null>(null)
const props = defineProps<{ data?: Array<{x: number|string; y: number}> }>()
onMounted(() => {
  const ctx = el.value!.getContext('2d')!
  new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Volume',
          data: props.data ?? [
            { x: Date.now()-6*864e5, y: 4200 },
            { x: Date.now()-5*864e5, y: 5000 },
            { x: Date.now()-4*864e5, y: 6100 },
            { x: Date.now()-3*864e5, y: 5800 },
            { x: Date.now()-2*864e5, y: 7200 },
            { x: Date.now()-1*864e5, y: 6800 },
            { x: Date.now(), y: 7600 },
          ],
          tension: .3,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false, type: 'time' as const },
        y: { display: false }
      }
    }
  })
})
</script>
