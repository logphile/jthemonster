type SetItem = {
  id: string
  exercise: string
  weight: number
  reps: number
  ts: number // epoch ms
}

const KEY = 'jt_sets_v1'

export function useRecentSets() {
  const items = useState<SetItem[]>('recentSets', () => [])
  const loaded = useState('recentSetsLoaded', () => false)

  if (process.client && !loaded.value) {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) items.value = JSON.parse(raw)
    } catch {}
    loaded.value = true
  }

  // persist on change
  watch(items, (v) => {
    if (process.client) localStorage.setItem(KEY, JSON.stringify(v))
  }, { deep: true })

  function add(exercise: string, weight: number, reps: number) {
    items.value.unshift({
      id: (globalThis as any).crypto?.randomUUID?.() || String(Date.now()),
      exercise, weight, reps, ts: Date.now()
    })
  }

  function removeByIndex(i: number) {
    items.value.splice(i, 1)
  }

  function lastLabel() {
    const it = items.value[0]
    return it ? `${it.exercise} ${it.weight} × ${it.reps}` : '—'
  }

  function volume7d() {
    const since = Date.now() - 7 * 864e5
    return items.value
      .filter(s => s.ts >= since)
      .reduce((sum, s) => sum + s.weight * s.reps, 0)
  }

  function series7d() {
    // daily buckets for chart
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(); day.setHours(0,0,0,0); day.setDate(day.getDate() - (6 - i))
      return { x: +day, y: 0 }
    })
    for (const s of items.value) {
      const d = new Date(s.ts); d.setHours(0,0,0,0)
      const ix = days.findIndex(b => b.x === +d)
      const bucket = ix >= 0 ? days[ix] : undefined
      if (bucket) bucket.y += s.weight * s.reps
    }
    return days
  }

  function repeatLast() {
    const it = items.value[0]
    if (it) add(it.exercise, it.weight, it.reps + 1)
  }

  return { items, add, removeByIndex, lastLabel, volume7d, series7d, repeatLast }
}
