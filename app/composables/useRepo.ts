// ~/composables/useRepo.ts
import { db, type Session, type SetRecord, type Bodyweight } from '~/db/indexed'
import { startOfMonth, endOfMonth } from 'date-fns'

const todayISO = () => new Date().toISOString().slice(0,10)
const nano = () => crypto.randomUUID()

export function useRepo() {
  // ---- Sessions
  const getOrCreateSession = async (date = todayISO(), split?: string): Promise<Session> => {
    let s = await db.sessions.where('date').equals(date).first()
    if (!s) {
      s = { id: nano(), date, split }
      await db.sessions.put(s)
    } else if (split && s.split !== split) {
      s.split = split; await db.sessions.put(s)
    }
    return s
  }

  const sessionById = (id: string) => db.sessions.get(id)
  const sessionByDate = (date: string) => db.sessions.where('date').equals(date).first()

  // ---- Sets (all weights in LB)
  const addSet = async (payload: Omit<SetRecord,'id'|'sessionId'|'date'> & { date?: string; split?: string }) => {
    const date = payload.date ?? todayISO()
    const s = await getOrCreateSession(date, payload.split)
    const rec: SetRecord = {
      id: nano(),
      sessionId: s.id,
      date,
      exerciseId: payload.exerciseId,
      reps: payload.reps,
      weightLb: payload.weightLb,
      rpe: payload.rpe,
    }
    await db.sets.put(rec)
    return rec
  }

  const setsForSession = (sessionId: string) => db.sets.where('sessionId').equals(sessionId).toArray()

  // ---- Bodyweight (imperial)
  const logBodyweight = async (weightLb: number, date = todayISO()) => {
    const bw: Bodyweight = { id: date, date, weightLb }
    await db.bodyweights.put(bw)
    return bw
  }

  // ---- Calendar: sets count per day for a month
  const dayStatsForMonth = async (month: Date) => {
    const start = startOfMonth(month).toISOString().slice(0,10)
    const end = endOfMonth(month).toISOString().slice(0,10)
    const rows = await db.sets.where('date').between(start, end, true, true).toArray()
    const map: Record<string, { sets: number; sessionId?: string }> = {}
    for (const r of rows) {
      map[r.date] ??= { sets: 0 }
      map[r.date].sets++
      map[r.date].sessionId ??= r.sessionId
    }
    return map
  }

  // ---- Progress: top set weight per day for a given exercise (or all)
  const progressPoints = async (exerciseId?: string) => {
    let rows = await db.sets.orderBy('date').toArray()
    if (exerciseId && exerciseId !== 'all') rows = rows.filter(r => r.exerciseId === exerciseId)

    // group by date -> max weight and hold sessionId
    const byDate: Record<string, { y: number; sessionId: string }> = {}
    for (const r of rows) {
      const prev = byDate[r.date]
      const val = r.weightLb ?? 0
      const prevY = prev?.y ?? -Infinity
      if (val > prevY) byDate[r.date] = { y: val, sessionId: r.sessionId }
    }
    return Object.entries(byDate)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([x, v]) => ({ x, y: v.y, sessionId: v.sessionId }))
  }

  // ---- Utilities for selects
  const exercisesBySplit = async (split: string) => {
    return db.exercises.where('split').equals(split).toArray()
  }

  // ---- Utilities: all exercises list (id/name)
  const allExercises = async () => {
    const rows = await db.exercises.orderBy('name').toArray()
    return rows.map(r => ({ id: r.id, name: r.name }))
  }

  return {
    // sessions/sets
    getOrCreateSession, sessionById, sessionByDate, addSet, setsForSession,
    // bodyweight
    logBodyweight,
    // calendar + progress
    dayStatsForMonth, progressPoints,
    // selects
    exercisesBySplit,
    allExercises,
  }
}
