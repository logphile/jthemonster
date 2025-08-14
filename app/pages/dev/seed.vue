<script setup lang="ts">
import { addDays, subDays, eachDayOfInterval, formatISO, getDay } from 'date-fns'
import { SPLITS, getExercisesForSplit, type SplitKey } from '~/data/exercises'
import { useRepo } from '~/composables/useRepo'

const cfg = useRuntimeConfig().public as any
const supabase = useSupabaseClient()
const { getOrCreateSession, addSet, logBodyweight } = useRepo()

const state = reactive({ running: false, createdSessions: 0, createdSets: 0, createdBws: 0, msg: '' })

// Map weekday -> split (adjust if you like)
const weekdaySplit: Record<number, SplitKey | null> = {
  0: 'shouldersAbs', // Sun
  1: 'chestTris',    // Mon
  2: null,           // Tue rest
  3: 'backBis',      // Wed
  4: null,           // Thu rest
  5: 'legs',         // Fri
  6: null            // Sat rest
}

// small helpers
const rand = (min:number, max:number) => Math.random() * (max - min) + min
const choice = <T,>(arr:T[], n:number) => arr.slice().sort(()=>0.5-Math.random()).slice(0, n)

const requireAuth = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!cfg.enableSeed || !user || user.email !== cfg.seedEmail) {
    // hide this route to everyone else
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  return user
}

const runSeed = async () => {
  if (state.running) return
  await requireAuth()
  state.running = true
  state.createdSessions = state.createdSets = state.createdBws = 0
  state.msg = 'Seeding…'

  // last 60 days
  const days = eachDayOfInterval({ start: subDays(new Date(), 59), end: new Date() })
  const bw0 = 172 // baseline bodyweight
  for (const d of days) {
    const date = formatISO(d, { representation: 'date' }) // YYYY-MM-DD
    // bodyweight daily with tiny noise
    await logBodyweight(Math.round((bw0 + rand(-3, 3)) * 10) / 10, date)
    state.createdBws++

    const split = weekdaySplit[getDay(d)]
    if (!split) continue

    // ensure session exists
    const session = await getOrCreateSession(date, split)
    state.createdSessions++

    // pick 3–4 exercises for this split
    const exs = choice(getExercisesForSplit(split), 3 + Math.round(Math.random()))
    for (const ex of exs) {
      // progress trend: older days lighter, recent days heavier
      const dayIndex = Math.abs((+new Date() - +d) / (1000*60*60*24))
      const trend = 1 + (60 - dayIndex) * 0.003  // ~18% gain across 60d, just for demo
      // a simple baseline per split
      const base =
        split === 'legs' ? 185 :
        split === 'backBis' ? 145 :
        split === 'chestTris' ? 135 :
        split === 'shouldersAbs' ? 85 : 95

      const top = Math.round((base * trend + rand(-10, 10)) / 5) * 5 // top set lb
      const sets = 3 + Math.round(Math.random()) // 3–4 sets

      for (let s = 0; s < sets; s++) {
        const pct = [0.9, 1.0, 0.95, 0.9][s] ?? 0.9
        const w = Math.max(5, Math.round(top * pct / 5) * 5) // in lb
        const reps = [10, 8, 8, 12][s] ?? 10
        await addSet({
          exerciseId: ex.id,
          reps,
          weightLb: w,
          rpe: Math.round(rand(7, 9)*10)/10,
          date,
          split
        })
        state.createdSets++
      }
    }
  }

  state.msg = `Done. ${state.createdSessions} sessions, ${state.createdSets} sets, ${state.createdBws} bodyweights.`
  state.running = false
}

const wipe60d = async () => {
  await requireAuth()
  // quick local wipe of last 60d (Dexie-only)
  const start = formatISO(subDays(new Date(), 59), { representation: 'date' })
  const end = formatISO(new Date(), { representation: 'date' })
  const { db } = await import('~/db/indexed')
  await db.transaction('rw', db.sets, db.sessions, db.bodyweights, async () => {
    await db.sets.where('date').between(start, end, true, true).delete()
    await db.sessions.where('date').between(start, end, true, true).delete()
    await db.bodyweights.where('date').between(start, end, true, true).delete()
  })
  state.msg = 'Wiped last 60 days of local data.'
}

// Seed sets directly into Supabase for the last N days
const seedSets = async (days = 30) => {
  const user = await requireAuth()
  state.msg = 'Seeding sets to Supabase…'
  const today = new Date()
  // Ensure these exercises exist in your Supabase exercises table
  const exIds = [1, 2, 3, 4]
  const rows: any[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    for (const ex of exIds) {
      rows.push({
        user_id: user.id,
        date,
        exercise_id: ex,
        reps: 8,
        weight_lb: 135 + (i % 5) * 5,
        rpe: 7.5
      })
    }
  }
  const { error } = await (supabase as any).from('sets').insert(rows as any[])
  if (error) throw error
  state.msg = `Seeded ${rows.length} sets to Supabase. Go to Settings → Sync Now.`
}
</script>

<template>
  <div class="p-6 space-y-4">
    <h1 class="text-xl font-bold">Seed Demo Data</h1>
    <p class="text-sm opacity-80">
      Only available when logged in as <code>{{ (useRuntimeConfig().public as any).seedEmail }}</code>.
      Data is <b>local (Dexie)</b> and uses pounds.
    </p>

    <div class="flex gap-3 flex-wrap">
      <button class="rounded-lg px-4 py-2 text-white bg-gradient-to-br from-firepink-600 to-firepink-700 disabled:opacity-50" :disabled="state.running" @click="runSeed">
        {{ state.running ? 'Seeding…' : 'Seed last 60 days (local)' }}
      </button>
      <button class="rounded-lg px-4 py-2 bg-white/10" @click="wipe60d">Wipe last 60 days (local)</button>
      <button class="rounded-lg px-4 py-2 text-white bg-gradient-to-br from-firepink-600 to-firepink-700" @click="seedSets(30)">
        Seed sets (30d) → Supabase
      </button>
    </div>

    <p class="text-sm opacity-70">{{ state.msg }}</p>
  </div>
</template>
