<script setup lang="ts">
// Lazy import heavy bits
const TodayCard = defineAsyncComponent(() => import('~/components/TodayCard.vue'))
const QuickLogSheet = defineAsyncComponent(() => import('~/components/QuickLogSheet.vue'))
const SetList = defineAsyncComponent(() => import('~/components/SetList.vue'))
const MiniVolumeChart = defineAsyncComponent(() => import('~/components/MiniVolumeChart.vue'))

// Data and actions
const { items, add, removeByIndex } = useRecentSets()
const sheetOpen = ref(false)

function onSave(payload: { exercise: string; weight: number; reps: number }){
  add(payload.exercise, payload.weight, payload.reps)
}

onMounted(() => {
  // startSyncLoop?.()
})
</script>

<template>
  <main class="min-h-dvh pb-28">
    <div class="mx-auto max-w-md p-4 space-y-4">
      <TodayCard />

      <section class="rounded-2xl p-3 bg-white/5 backdrop-blur">
        <h2 class="text-sm font-semibold opacity-80 mb-2">Quick Log</h2>
        <QuickLogSheet v-model="sheetOpen" @save="onSave" />
      </section>

      <section class="rounded-2xl p-3 bg-white/5 backdrop-blur">
        <h2 class="text-sm font-semibold opacity-80 mb-2">Recent Sets</h2>
        <ClientOnly>
          <SetList :items="items" @remove="removeByIndex" />
        </ClientOnly>
      </section>

      <ClientOnly>
        <MiniVolumeChart />
      </ClientOnly>
    </div>

    <!-- FAB -->
    <button
      class="fixed bottom-5 right-5 rounded-full px-5 py-3 shadow-lg text-sm font-semibold bg-red-600 hover:bg-red-500 active:scale-95 transition"
      @click="sheetOpen = true"
    >
      Log Set
    </button>
  </main>
  
</template>
