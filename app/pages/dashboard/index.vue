<script setup lang="ts">
// Lazy import heavy bits
const TodayCard = defineAsyncComponent(() => import('~/components/TodayCard.vue'))
const SetList = defineAsyncComponent(() => import('~/components/SetList.vue'))
const MiniVolumeChart = defineAsyncComponent(() => import('~/components/MiniVolumeChart.vue'))
const MonthGrid = defineAsyncComponent(() => import('~/components/calendar/MonthGrid.vue'))
const DayDetailSheet = defineAsyncComponent(() => import('~/components/calendar/DayDetailSheet.vue'))
const SplitSelect = defineAsyncComponent(() => import('~/components/plan/SplitSelect.vue'))
const ExerciseSelect = defineAsyncComponent(() => import('~/components/plan/ExerciseSelect.vue'))
const WeightLogButton = defineAsyncComponent(() => import('~/components/plan/WeightLogButton.vue'))
const ExerciseToggleChips = defineAsyncComponent(() => import('~/components/progress/ExerciseToggleChips.vue'))
const ProgressChart = defineAsyncComponent(() => import('~/components/progress/ProgressChart.vue'))
const ExerciseSelector = defineAsyncComponent(() => import('~/components/log/ExerciseSelector.vue'))

// Data and actions (Dexie-backed)
const { dayStatsForMonth, progressPoints, allExercises, getOrCreateSession, setsForSession } = useRepo()
import type { Session } from '~/db/indexed'
const { session: authSession, getSession } = useAuth()
const displayName = computed(() => {
  const u = (authSession.value as any)?.user
  return (
    u?.user_metadata?.full_name ||
    u?.user_metadata?.name ||
    u?.email?.split('@')[0] ||
    'Athlete'
  )
})
import { useQuickLog } from '~/composables/useQuickLog'
const session = ref<Session | null>(null)
const sessionId = computed(() => session.value?.id ?? null)
const loading = ref(true)
const { open: openQL } = useQuickLog()

// Local onSave removed — global Quick Log handles persistence and emits jt:set-saved

onMounted(async () => {
  // user might be null in guest mode — that's fine
  try {
    // Optional: pull recent cloud data into local Dexie before creating today's session
    try {
      const mod = await import('~/composables/useSync')
      const fn = (mod as any)?.importFromSupabase as undefined | ((days: number) => Promise<void>)
      if (typeof fn === 'function') {
        await fn(60).catch(() => null)
      }
    } catch (e) {
      // ignore if useSync or method not available
    }
    if (!authSession.value) await getSession().catch(() => null)
    // Ensure today's session exists before rendering dependent widgets
    session.value = await getOrCreateSession().catch(() => null)
    await refreshRecent()
    await refreshMonth()
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
const daySheetOpen = ref(false)
const daySheetDate = ref<string>('')
function openDay(p:{date:string}){ daySheetDate.value = p.date; daySheetOpen.value = true }

// Plan state
const split = ref('chestTris')
const selectedExercises = ref<string[]>([])
function onWeightSaved(){ /* TODO toast */ }

// Quick log handler for selector — open global Quick Log with prefill
function startQuickLog(category: string, exerciseId: string){
  openQL({ category, exerciseId })
}

function onExerciseSelect(payload: { category: string; exerciseId: string }){
  startQuickLog(payload.category, payload.exerciseId)
}

// Progress state: load top set weights per day for a given exercise (or all)
const exerciseId = ref<string>('all')
const chartPoints = ref<Array<{ x: string; y: number; sessionId: string }>>([])
async function refreshPoints(){ chartPoints.value = await progressPoints(exerciseId.value) }
watch(exerciseId, refreshPoints, { immediate: true })
// refreshPoints is also called on jt events below

// Exercise chips options
const exerciseOptions = ref<Array<{ id:string; name:string }>>([])
onMounted(async () => { exerciseOptions.value = await allExercises() })

// Recent sets for current session (mapped to SetList shape)
const recent = ref<Array<{ exercise:string; weight:number; reps:number }>>([])
async function refreshRecent() {
  if (!session.value?.id) return
  const rows = await setsForSession(session.value.id)
  const ex = await allExercises()
  const nameById = Object.fromEntries(ex.map(x => [x.id, x.name]))
  recent.value = rows
    .sort((a,b) => (b.date + (b.id||''))
      .localeCompare(a.date + (a.id||'')))
    .slice(0, 50)
    .map(r => ({
      exercise: nameById[r.exerciseId] ?? r.exerciseId,
      weight: r.weightLb ?? 0,
      reps: r.reps ?? 0,
    }))
}

// Update UI when sets are saved or sync finishes
onMounted(() => {
  const onSaved = async () => { await refreshRecent(); await refreshMonth(); await refreshPoints() }
  window.addEventListener('jt:set-saved', onSaved as any)
  onBeforeUnmount(() => window.removeEventListener('jt:set-saved', onSaved as any))
})

// Refresh data after a manual sync completes
onMounted(() => {
  const onSync = () => { refreshRecent(); refreshMonth(); refreshPoints() }
  window.addEventListener('jt:sync-finished', onSync)
  onBeforeUnmount(() => window.removeEventListener('jt:sync-finished', onSync))
})
</script>

<template>
  <main class="min-h-dvh pb-28">
    <div class="mx-auto max-w-md p-4 space-y-4">
      <section class="rounded-2xl p-3 bg-white/5 backdrop-blur mb-3">
        <p class="text-sm opacity-80">Welcome, {{ displayName }}! Let’s get it 💪</p>
      </section>
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
        <h2 class="text-sm font-semibold opacity-80 mb-2">Recent Sets</h2>
        <ClientOnly>
          <SetList v-if="sessionId" :session-id="sessionId" :items="recent" />
          <div v-else class="animate-pulse text-sm opacity-60">Loading session…</div>
        </ClientOnly>
      </section>

      <!-- Log Exercise -->
      <section class="rounded-2xl p-3 bg-white/5 backdrop-blur">
        <h2 class="text-sm font-semibold opacity-80 mb-2">Log Exercise</h2>
        <ExerciseSelector @select="onExerciseSelect" />
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
  </main>
  
  <ClientOnly>
    <DayDetailSheet v-if="daySheetOpen" :date="daySheetDate" :sessions="[]" :sets="[]" @close="daySheetOpen=false" />
  </ClientOnly>
  
</template>
