<template>
  <div class="rounded-2xl bg-card border border-border/60 p-4">
    <h3 class="font-display text-lg mb-2">Weekly Volume</h3>
    <canvas ref="el" class="h-36 w-full"></canvas>
  </div>
  
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

let cleanup: (() => void) | null = null
const el = ref<HTMLCanvasElement | null>(null)

onMounted(async () => {
  try {
    const { Chart, LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale } = await import('chart.js')
    await import('chartjs-adapter-date-fns')
    Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale)

    const ctx = el.value!.getContext('2d')!
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Volume',
            data: [
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
        scales: { x: { display: false, type: 'time' }, y: { display: false } }
      }
    })
    cleanup = () => chart.destroy()
  } catch (e) {
    // swallow errors – chart should never take down the page
    console.error('MiniVolumeChart error', e)
  }
})
</script>
