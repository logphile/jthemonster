<script setup lang="ts">
// Lazy import heavy bits
const TodayCard = defineAsyncComponent(() => import('~/components/TodayCard.vue'))
const QuickLogSheet = defineAsyncComponent(() => import('~/components/QuickLogSheet.vue'))
const SetList = defineAsyncComponent(() => import('~/components/SetList.vue'))
const MiniVolumeChart = defineAsyncComponent(() => import('~/components/MiniVolumeChart.vue'))
const MonthGrid = defineAsyncComponent(() => import('~/components/calendar/MonthGrid.vue'))
const DayDetailSheet = defineAsyncComponent(() => import('~/components/calendar/DayDetailSheet.vue'))
const SplitSelect = defineAsyncComponent(() => import('~/components/plan/SplitSelect.vue'))
const ExerciseSelect = defineAsyncComponent(() => import('~/components/plan/ExerciseSelect.vue'))
const WeightLogButton = defineAsyncComponent(() => import('~/components/plan/WeightLogButton.vue'))
const ExerciseToggleChips = defineAsyncComponent(() => import('~/components/progress/ExerciseToggleChips.vue'))
const ProgressChart = defineAsyncComponent(() => import('~/components/progress/ProgressChart.vue'))

// Data and actions
const { items, add, removeByIndex } = useRecentSets()
const { dayStatsForMonth, progressPoints, allExercises, addSet, getOrCreateSession } = useRepo()
import type { Session } from '~/db/indexed'
const { user, refreshUser } = useAuth()
const session = ref<Session | null>(null)
const sessionId = computed(() => session.value?.id ?? null)
const sheetOpen = ref(false)
const loading = ref(true)

async function onSave(payload: { exercise: string; weight: number; reps: number }){
  // existing local quick-log for demo lists
  add(payload.exercise, payload.weight, payload.reps)
  // also persist to Dexie so calendar/progress update
  await addSet({ exerciseId: payload.exercise, weightLb: payload.weight, reps: payload.reps, split: split.value })
  await refreshMonth()
  await refreshPoints()
}

onMounted(async () => {
  // user might be null in guest mode — that's fine
  try {
    if (user.value === null) await refreshUser().catch(() => null)
    // Ensure today's session exists before rendering dependent widgets
    session.value = await getOrCreateSession().catch(() => null)
  } finally {
    loading.value = false
  }
  // startSyncLoop?.()
})

// Calendar state: load per-day set counts for the current month from Dexie
const month = ref(new Date())
const dayStats = ref<Record<string, { sets:number; sessionId?: string }>>({})
async function refreshMonth(){ dayStats.value = await dayStatsForMonth(month.value) }
watch(month, refreshMonth, { immediate: true })
// also refresh when local items length changes (quick log)
watch(() => items.value.length, () => { refreshMonth() })
const daySheetOpen = ref(false)
const daySheetDate = ref<string>('')
function openDay(p:{date:string}){ daySheetDate.value = p.date; daySheetOpen.value = true }

// Plan state
const split = ref('chestTris')
const selectedExercises = ref<string[]>([])
function onWeightSaved(){ /* TODO toast */ }

// Progress state: load top set weights per day from Dexie
const exerciseId = ref<string>('all')
const chartPoints = ref<Array<{ x: string; y: number; sessionId: string }>>([])
async function refreshPoints(){ chartPoints.value = await progressPoints(exerciseId.value) }
watch(exerciseId, refreshPoints, { immediate: true })
watch(() => items.value.length, () => { refreshPoints() })

// Exercise chips options
const exerciseOptions = ref<Array<{ id:string; name:string }>>([])
onMounted(async () => { exerciseOptions.value = await allExercises() })
</script>

<template>
  <main class="min-h-dvh pb-28">
    <div class="mx-auto max-w-md p-4 space-y-4">
      <TodayCard :session-id="sessionId" />

      <!-- Calendar -->
      <section class="rounded-2xl p-3 bg-white/5 backdrop-blur">
        <div class="mb-2 flex items-center justify-between">
          <h2 class="text-sm font-semibold opacity-80">This Month</h2>
        </div>
        <ClientOnly>
          <MonthGrid :month="month" :day-stats="dayStats" @select="openDay" />
        </ClientOnly>
      </section>

      <section v-if="loading" class="rounded-2xl p-3 bg-white/5 backdrop-blur text-sm opacity-70">
        Loading…
      </section>

      <section class="rounded-2xl p-3 bg-white/5 backdrop-blur">
        <h2 class="text-sm font-semibold opacity-80 mb-2">Quick Log</h2>
        <QuickLogSheet v-if="sessionId" v-model="sheetOpen" :session-id="sessionId" @save="onSave" />
        <div v-else class="animate-pulse text-sm opacity-60">Loading session…</div>
      </section>

      <section class="rounded-2xl p-3 bg-white/5 backdrop-blur">
        <h2 class="text-sm font-semibold opacity-80 mb-2">Recent Sets</h2>
        <ClientOnly>
          <SetList v-if="sessionId" :session-id="sessionId" :items="items" @remove="removeByIndex" />
          <div v-else class="animate-pulse text-sm opacity-60">Loading session…</div>
        </ClientOnly>
      </section>

      <!-- Plan -->
      <section class="rounded-2xl p-3 bg-white/5 backdrop-blur">
        <h2 class="text-sm font-semibold opacity-80 mb-2">Plan</h2>
        <div class="space-y-3">
          <SplitSelect v-model="split" />
          <ExerciseSelect :split="split" v-model="selectedExercises" />
          <WeightLogButton @saved="onWeightSaved" />
        </div>
      </section>

      <!-- Progress -->
      <section class="rounded-2xl p-3 bg-white/5 backdrop-blur">
        <h2 class="text-sm font-semibold opacity-80 mb-2">Progress</h2>
        <ExerciseToggleChips v-model="exerciseId" :options="exerciseOptions" />
        <ClientOnly>
          <ProgressChart :points="chartPoints" label="Top Set (lb)" @point="() => {}" />
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
  
  <ClientOnly>
    <DayDetailSheet v-if="daySheetOpen" :date="daySheetDate" :sessions="[]" :sets="items.filter(s => new Date(s.ts).toISOString().slice(0,10)===daySheetDate)" @close="daySheetOpen=false" />
  </ClientOnly>
  
</template>
