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
const ProgressChart = defineAsyncComponent(() => import('~/components/progress/ProgressChart.vue'))
const ExerciseSelector = defineAsyncComponent(() => import('~/components/log/ExerciseSelector.vue'))

// Data and actions (Dexie-backed)
const { dayStatsForMonth, progressPoints, allExercises, getOrCreateSession, setsForSession, sessionByDate } = useRepo()
import type { Session } from '~/db/indexed'
import { useExercises as useExercisesStore } from '~/stores/exercises'
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
const daySheetSets = ref<Array<{ exercise:string; weight:number; reps:number; ts:number }>>([])
const daySheetSessions = ref<any[]>([])
const exerciseOptions = ref<Array<{ id:string; name:string }>>([])
onMounted(async () => { exerciseOptions.value = await allExercises() })

async function loadDayDetail(date: string) {
  try {
    const s = await sessionByDate(date).catch(() => null)
    daySheetSessions.value = s ? [s] : []
    if (s?.id) {
      const rows = await setsForSession(s.id)
      let opts = exerciseOptions.value
      if (!opts.length) opts = await allExercises()
      const nameById = Object.fromEntries(opts.map((x: any) => [x.id, x.name]))
      daySheetSets.value = rows
        .map(r => ({
          exercise: nameById[r.exerciseId] ?? r.exerciseId,
          weight: r.weightLb ?? 0,
          reps: r.reps ?? 0,
          ts: Date.parse(r.date + 'T00:00:00Z'),
        }))
        .sort((a,b) => b.ts - a.ts)
    } else {
      daySheetSets.value = []
    }
  } catch {
    daySheetSets.value = []
    daySheetSessions.value = []
  }
}

async function openDay(p:{date:string}){
  daySheetDate.value = p.date
  await loadDayDetail(p.date)
  daySheetOpen.value = true
}

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
const exerciseId = ref<string | null>(null)
const chartPoints = ref<Array<{ x: string; y: number; sessionId: string }>>([])
// Date range controls (default: last 30 days)
const toISO = (d: Date) => d.toISOString().slice(0,10)
const rangeTo = ref<string>(toISO(new Date()))
const rangeFrom = ref<string>(toISO(new Date(Date.now() - 29 * 24 * 3600 * 1000)))
function normalizeRange(){ if (rangeFrom.value > rangeTo.value) rangeTo.value = rangeFrom.value }
watch([rangeFrom, rangeTo], normalizeRange)
async function refreshPoints(){
  chartPoints.value = await progressPoints(
    exerciseId.value ?? undefined,
    rangeFrom.value,
    rangeTo.value,
  )
}
watch([exerciseId, rangeFrom, rangeTo], refreshPoints, { immediate: true })
// refreshPoints is also called on jt events below

const categoryOptions = [
  { value: 'chest', label: 'Chest' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'back', label: 'Back' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'legs', label: 'Legs' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'abs', label: 'Abs' },
] as const
type CategoryKey = typeof categoryOptions[number]['value']
const selectedCategory = ref<CategoryKey | ''>('')
const legsParts = new Set(['quads', 'hamstrings', 'glutes', 'calves'])
// Exercises store for filtering
const exStore = useExercisesStore()
onMounted(() => { exStore.load() })
const filteredExercises = computed(() => {
  if (!selectedCategory.value) return [] as Array<{ id:string; name:string }>
  return (exStore.list || [])
    .filter((e: any) => {
      if (selectedCategory.value === 'legs') return legsParts.has(e.bodypart)
      if (selectedCategory.value === 'abs') return e.bodypart === 'abs' || e.bodypart === 'core'
      return e.bodypart === selectedCategory.value
    })
    .map((e: any) => ({ id: e.id, name: e.name }))
    .sort((a: { id:string; name:string }, b: { id:string; name:string }) => a.name.localeCompare(b.name))
})
watch(selectedCategory, () => { exerciseId.value = null })

// Chart type
const chartType = ref<'line' | 'bar'>('line')

// Recent sets for current session (mapped to SetList shape)
const recent = ref<Array<{ exercise:string; weight:number; reps:number }>>([])
async function refreshRecent() {
  if (!session.value?.id) return
  const rows = await setsForSession(session.value.id)
  const ex = await allExercises()
  const nameById = Object.fromEntries(ex.map((x: any) => [x.id, x.name]))
  recent.value = rows
    .sort((a:any,b:any) => (b.date + (b.id||''))
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
  const onSaved = async (ev: any) => {
    await refreshRecent(); await refreshMonth(); await refreshPoints()
    try {
      const saved = (ev as CustomEvent)?.detail as any
      if (daySheetOpen.value && saved?.date === daySheetDate.value) {
        await loadDayDetail(daySheetDate.value)
      }
    } catch {}
  }
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
        <div class="grid gap-2 sm:grid-cols-2">
          <div>
            <label class="block mb-1 text-xs opacity-70">Category</label>
            <select v-model="selectedCategory" class="w-full px-3 py-2 rounded bg-black/40 border border-white/10">
              <option :value="''">All (no filter)</option>
              <option v-for="c in categoryOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
          </div>
          <div>
            <label class="block mb-1 text-xs opacity-70">Exercise</label>
            <select v-model="exerciseId" class="w-full px-3 py-2 rounded bg-black/40 border border-white/10" :disabled="!selectedCategory">
              <option :value="null">All exercises</option>
              <option v-for="e in filteredExercises" :key="e.id" :value="e.id">{{ e.name }}</option>
            </select>
          </div>
        </div>

        <div class="mt-3 grid gap-2 sm:grid-cols-3">
          <div>
            <label class="block mb-1 text-xs opacity-70">From</label>
            <input type="date" v-model="rangeFrom" :max="rangeTo" class="w-full px-3 py-2 rounded bg-black/40 border border-white/10" />
          </div>
          <div>
            <label class="block mb-1 text-xs opacity-70">To</label>
            <input type="date" v-model="rangeTo" :min="rangeFrom" class="w-full px-3 py-2 rounded bg-black/40 border border-white/10" />
          </div>
          <div>
            <label class="block mb-1 text-xs opacity-70">Chart Type</label>
            <select v-model="chartType" class="w-full px-3 py-2 rounded bg-black/40 border border-white/10">
              <option value="line">Line</option>
              <option value="bar">Bar</option>
            </select>
          </div>
        </div>

        <ClientOnly>
          <ProgressChart :points="chartPoints" :type="chartType" label="Top Set (lb)" @point="() => {}" />
        </ClientOnly>
      </section>

      <ClientOnly>
        <MiniVolumeChart />
      </ClientOnly>
    </div>
  </main>
  
  <ClientOnly>
    <DayDetailSheet v-if="daySheetOpen" :date="daySheetDate" :sessions="daySheetSessions" :sets="daySheetSets" @close="daySheetOpen=false" />
  </ClientOnly>
  
</template>
