<template>
  <Card>
    <div class="p-4">
      <h3 class="font-display text-lg mb-2">Weekly Volume</h3>
      <canvas ref="el" class="h-36 w-full"></canvas>
    </div>
  </Card>
</template>

<script setup lang="ts">
const { series7d } = useRecentSets()
const el = ref<HTMLCanvasElement | null>(null)

onMounted(async () => {
  try {
    const { Chart, LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale } = await import('chart.js')
    await import('chartjs-adapter-date-fns')
    Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, CategoryScale)

    const ctx = el.value!.getContext('2d')!
    new Chart(ctx, {
      type: 'line',
      data: { datasets: [{ data: series7d(), tension: .3, borderWidth: 2 }] },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { display: false, type: 'time' }, y: { display: false } }
      }
    })
  } catch (e) { console.error('MiniVolumeChart error', e) }
})
</script>
