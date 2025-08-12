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

// Data and actions
const { items, add, removeByIndex } = useRecentSets()
const { dayStatsForMonth, progressPoints, allExercises, getOrCreateSession } = useRepo()
import type { Session } from '~/db/indexed'
const { user, refreshUser } = useAuth()
const displayName = computed(() =>
  user.value?.user_metadata?.full_name ||
  user.value?.user_metadata?.name ||
  user.value?.email?.split('@')[0] ||
  'Athlete'
)
import { useQuickLog } from '~/composables/useQuickLog'
const session = ref<Session | null>(null)
const sessionId = computed(() => session.value?.id ?? null)
const loading = ref(true)
const { isOpen: isQLOpen, open: openQL } = useQuickLog()

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

// Quick log handler for selector — open global Quick Log with prefill
function startQuickLog(category: string, exerciseId: string){
  openQL({ category, exerciseId })
}

function onExerciseSelect(payload: { category: string; exerciseId: string }){
  startQuickLog(payload.category, payload.exerciseId)
}

// Progress state: load top set weights per day from Dexie
const exerciseId = ref<string>('all')
const chartPoints = ref<Array<{ x: string; y: number; sessionId: string }>>([])
async function refreshPoints(){ chartPoints.value = await progressPoints(exerciseId.value) }
watch(exerciseId, refreshPoints, { immediate: true })
watch(() => items.value.length, () => { refreshPoints() })

// Exercise chips options
const exerciseOptions = ref<Array<{ id:string; name:string }>>([])
onMounted(async () => { exerciseOptions.value = await allExercises() })

// Listen for global quick-log saves (from teleported sheet)
onMounted(() => {
  const handler = (e: any) => {
    const s = e?.detail
    if (!s) return
    // Optimistic recent list update
    add(String(s.exerciseId), Number(s.weightLb || s.weight || 0), Number(s.reps || 0))
    // Optimistically bump today's calendar count for instant highlight
    try {
      const d = String(s.date || new Date().toISOString().slice(0,10))
      const prev = dayStats.value[d] || { sets: 0 }
      dayStats.value = { ...dayStats.value, [d]: { ...prev, sets: (prev.sets || 0) + 1 } }
    } catch {}
    // Refresh calendar/progress (authoritative)
    refreshMonth()
    refreshPoints()
  }
  window.addEventListener('jt:set-saved', handler as any)
  onBeforeUnmount(() => window.removeEventListener('jt:set-saved', handler as any))
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

      <section class="rounded-2xl p-3 bg-white/5 backdrop-blur" v-show="!isQLOpen">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold opacity-80">Quick Log</h2>
          <button
            class="rounded-lg px-3 py-1 bg-red-600 text-white"
            @click="openQL({ category: 'chestTris', exerciseId: '' })"
          >
            Open
          </button>
        </div>
      </section>

      <section class="rounded-2xl p-3 bg-white/5 backdrop-blur">
        <h2 class="text-sm font-semibold opacity-80 mb-2">Recent Sets</h2>
        <ClientOnly>
          <SetList v-if="sessionId" :session-id="sessionId" :items="items" @remove="removeByIndex" />
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
    <DayDetailSheet v-if="daySheetOpen" :date="daySheetDate" :sessions="[]" :sets="items.filter(s => new Date(s.ts).toISOString().slice(0,10)===daySheetDate)" @close="daySheetOpen=false" />
  </ClientOnly>
  
</template>
