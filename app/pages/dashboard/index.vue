<script setup lang="ts">
// Lazy import heavy bits
const TodayCard = defineAsyncComponent(() => import('~/components/TodayCard.vue'))
const SetList = defineAsyncComponent(() => import('~/components/SetList.vue'))
const MonthGrid = defineAsyncComponent(() => import('~/components/calendar/MonthGrid.vue'))
const DayDetailSheet = defineAsyncComponent(() => import('~/components/calendar/DayDetailSheet.vue'))
const SplitSelect = defineAsyncComponent(() => import('~/components/plan/SplitSelect.vue'))
const ExerciseSelect = defineAsyncComponent(() => import('~/components/plan/ExerciseSelect.vue'))
const WeightLogButton = defineAsyncComponent(() => import('~/components/plan/WeightLogButton.vue'))
const ProgressChart = defineAsyncComponent(() => import('~/components/progress/ProgressChart.vue'))
const ProgressChartModal = defineAsyncComponent(() => import('~/components/progress/ProgressChartModal.vue'))
const ExerciseSelector = defineAsyncComponent(() => import('~/components/log/ExerciseSelector.vue'))
import UiChip from '~/components/ui/Chip.vue'

// Data and actions (Dexie-backed)
const { dayStatsForMonth, progressPoints, bodyweightPoints, allExercises, getOrCreateSession, setsForSession, sessionByDate } = useRepo()
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

// Utility: titleize fallback slugs like 'bench-press' -> 'Bench Press'
function titleFromSlug(s: string) {
  if (!s) return s
  // If already a display label (spaces or uppercase), leave as-is
  if (s.includes(' ') || /[A-Z]/.test(s)) return s
  return s
    .split(/[-_]+/g)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

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
          exercise: titleFromSlug(nameById[r.exerciseId] ?? r.exerciseId),
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
  if (selectedCategory.value === 'weight') {
    chartPoints.value = await bodyweightPoints(
      rangeFrom.value,
      rangeTo.value,
    )
  } else {
    chartPoints.value = await progressPoints(
      exerciseId.value ?? undefined,
      rangeFrom.value,
      rangeTo.value,
    )
  }
}
watch([exerciseId, rangeFrom, rangeTo], refreshPoints, { immediate: true })
// refreshPoints is also called on jt events below

// Fullscreen chart modal
const largeChartOpen = ref(false)
watch(chartPoints, (nv, ov) => {
  if ((nv?.length || 0) > 0 && (!ov || ov.length === 0)) {
    // Auto-open when the first results arrive
    largeChartOpen.value = true
  }
})
function openLarge() { if (chartPoints.value.length) largeChartOpen.value = true }

const categoryOptions = [
  { value: 'weight', label: 'Weight' },
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
const isWeight = computed(() => selectedCategory.value === 'weight')
const legsParts = new Set(['quads', 'hamstrings', 'glutes', 'calves'])
// Exercises store for filtering
const exStore = useExercisesStore()
onMounted(() => { exStore.load() })
const filteredExercises = computed(() => {
  if (!selectedCategory.value || isWeight.value) return [] as Array<{ id:string; name:string }>
  return (exStore.list || [])
    .filter((e: any) => {
      if (selectedCategory.value === 'legs') return legsParts.has(e.bodypart)
      if (selectedCategory.value === 'abs') return e.bodypart === 'abs' || e.bodypart === 'core'
      return e.bodypart === selectedCategory.value
    })
    .map((e: any) => ({ id: e.id, name: e.name }))
    .sort((a: { id:string; name:string }, b: { id:string; name:string }) => a.name.localeCompare(b.name))
})
watch(selectedCategory, () => { exerciseId.value = null; refreshPoints() })

// Refresh chart after logging weight when in Weight mode
function onWeightSaved(){
  if (selectedCategory.value === 'weight') refreshPoints()
}

// Chart type
const chartType = ref<'line' | 'bar'>('line')
const chartLabel = computed(() => isWeight.value ? 'Bodyweight (lb)' : 'Top Set (lb)')

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
      exercise: titleFromSlug(nameById[r.exerciseId] ?? r.exerciseId),
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
      <section class="card">
        <p class="text-sm opacity-90 font-hud tracking-wide">LOCK IN! LET'S GET IT! 💪</p>
      </section>
      <TodayCard :session-id="sessionId" />

      <!-- Calendar -->
      <section class="card">
        <div class="mb-2 flex items-center justify-between">
          <h2 class="text-sm font-semibold opacity-90 font-hud">This Month</h2>
        </div>
        <ClientOnly>
          <MonthGrid :month="month" :day-stats="dayStats" @select="openDay" />
        </ClientOnly>
      </section>

      <section v-if="loading" class="card text-sm opacity-80">
        Loading…
      </section>

      

      <section class="card">
        <h2 class="text-sm font-semibold opacity-90 font-hud mb-2">Recent Sets</h2>
        <ClientOnly>
          <SetList v-if="sessionId" :session-id="sessionId" :items="recent" />
          <div v-else class="animate-pulse text-sm opacity-60">Loading session…</div>
        </ClientOnly>
      </section>

      <!-- Log Exercise -->
      <section class="card">
        <h2 class="text-sm font-semibold opacity-90 font-hud mb-2">Log Exercise</h2>
        <ExerciseSelector @select="onExerciseSelect" />
      </section>

      <!-- Log Weight -->
      <section class="card">
        <h2 class="text-sm font-semibold opacity-90 font-hud mb-2">Log Weight</h2>
        <ClientOnly>
          <WeightLogButton @saved="onWeightSaved" />
        </ClientOnly>
      </section>

      <!-- Progress -->
      <section class="card">
        <h2 class="text-sm font-semibold opacity-90 font-hud mb-2 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="w-4 h-4 text-yellow-400">
            <path d="M6 2a1 1 0 011 1v1h10V3a1 1 0 112 0v1h1a1 1 0 011 1v15a2 2 0 01-2 2H5a2 2 0 01-2-2V5a1 1 0 011-1h1V3a1 1 0 112 0v1zm13 6H5v11a1 1 0 001 1h12a1 1 0 001-1V8z" />
          </svg>
          Progress
        </h2>
        <div class="space-y-2">
          <div>
            <label class="block mb-1 text-xs opacity-70">Category</label>
            <div class="flex flex-wrap gap-2">
              <UiChip :active="selectedCategory === ''" @click="selectedCategory = ''">All</UiChip>
              <UiChip v-for="c in categoryOptions" :key="c.value" :active="selectedCategory === c.value" @click="selectedCategory = c.value">
                {{ c.label }}
              </UiChip>
            </div>
          </div>
          <div v-if="!isWeight">
            <label class="block mb-1 text-xs opacity-70">Exercise</label>
            <select v-model="exerciseId" class="select w-full" :disabled="!selectedCategory || isWeight">
              <option :value="null">All exercises</option>
              <option v-for="e in filteredExercises" :key="e.id" :value="e.id">{{ e.name }}</option>
            </select>
          </div>
        </div>

        <div class="mt-3 grid gap-2 sm:grid-cols-3">
          <div>
            <label class="block mb-1 text-xs opacity-70">From</label>
            <input type="date" v-model="rangeFrom" :max="rangeTo" class="input" />
          </div>
          <div>
            <label class="block mb-1 text-xs opacity-70">To</label>
            <input type="date" v-model="rangeTo" :min="rangeFrom" class="input" />
          </div>
          <div>
            <label class="block mb-1 text-xs opacity-70">Chart Type</label>
            <select v-model="chartType" class="select w-full">
              <option value="line">Line</option>
              <option value="bar">Bar</option>
            </select>
          </div>
        </div>

        <div class="mt-2">
          <div class="h-56 w-full">
            <ClientOnly>
              <ProgressChart :points="chartPoints" :type="chartType" :label="chartLabel" @point="() => {}" />
            </ClientOnly>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <p class="text-xs opacity-70" v-if="!chartPoints.length">No data for the selected filters and date range.</p>
            <button class="ml-auto btn-secondary text-xs disabled:opacity-40" :disabled="!chartPoints.length" @click="openLarge">View Large Chart</button>
          </div>
        </div>
      </section>

      
    </div>
  </main>
  
  <ClientOnly>
    <DayDetailSheet v-if="daySheetOpen" :date="daySheetDate" :sessions="daySheetSessions" :sets="daySheetSets" @close="daySheetOpen=false" />
  </ClientOnly>
  <ClientOnly>
    <ProgressChartModal :open="largeChartOpen" :points="chartPoints" :type="chartType" :label="chartLabel" @close="largeChartOpen=false" />
  </ClientOnly>
  
</template>
