import { defineStore } from 'pinia'
import { db } from '~/db/indexed'
import { useAuth } from '~/composables/useAuth'
import { useSync } from '~/composables/useSync'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function uuid() {
  return crypto.randomUUID()
}

export type Unit = 'lb' | 'kg'

function toLb(weight: number, unit: Unit) {
  if (!Number.isFinite(weight)) return 0
  return unit === 'kg' ? weight * 2.2046226218 : weight
}

export const useWorkoutStore = defineStore('workout', () => {
  const { athleteUserId, canWrite } = useAuth()
  const { queue, push } = useSync()

  async function logSet(payload: { exerciseId: string | number; reps: number; weight: number; rpe?: number; unit: Unit; date?: string }) {
    if (!canWrite.value) return
    const uid = athleteUserId.value
    if (!uid) return
    const date = (payload.date && /\d{4}-\d{2}-\d{2}/.test(payload.date)) ? payload.date : todayKey()
    const unit = payload.unit
    const weightLb = toLb(Number(payload.weight || 0), unit)

    const item: any = {
      id: uuid(),
      user_id: uid,
      date,
      exerciseId: String(payload.exerciseId),
      reps: Number(payload.reps || 0),
      rpe: payload.rpe != null ? Number(payload.rpe) : undefined,
      weightLb,
      unit,           // additive field
      weight: weightLb, // keep legacy readers happy (some code reads `weight`)
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await db.sets.put(item as any)
    await queue({ table: 'sets', op: 'insert', payload: item })
    await push()
    return item
  }

  async function logBodyweight(value: number, unit: Unit = 'lb') {
    if (!canWrite.value) return
    const uid = athleteUserId.value
    if (!uid) return
    const date = todayKey()
    const weightLb = toLb(Number(value || 0), unit)

    const item: any = {
      id: date, // keep 1-per-day id shape
      user_id: uid,
      date,
      weightLb,
      unit,           // additive field
      value: weightLb, // for future mapping
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await db.bodyweights.put(item as any)
    await queue({ table: 'bodyweights', op: 'upsert', payload: item })
    await push()
  }

  async function lastUsedForExercise(exerciseId: string | number) {
    const arr = await db.sets
      .where('exerciseId')
      .equals(String(exerciseId))
      .reverse()
      .sortBy('id')
    return arr[0]
  }

  async function recentSets(limit = 6) {
    const arr = await db.sets.orderBy('date').reverse().toArray()
    return arr.slice(0, limit)
  }

  async function datesWithSets(monthISO: string) { // 'YYYY-MM'
    const uid = athleteUserId.value
    const start = monthISO + '-01'
    const endDate = new Date(start)
    endDate.setMonth(endDate.getMonth() + 1)
    const end = endDate.toISOString().slice(0, 10)
    const xs = await db.sets.where('date').between(start, end, true, false).toArray()
    const s = new Set<string>()
    xs.forEach((r: any) => {
      if (r.date >= start && r.date < end) s.add(r.date)
    })
    return s
  }

  return { logSet, logBodyweight, lastUsedForExercise, recentSets, datesWithSets }
})
