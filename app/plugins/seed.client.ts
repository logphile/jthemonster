import { db, nowIso, newId, type Exercise, type Session, type SetRow } from '~/db/indexed'

export default defineNuxtPlugin(async () => {
  const count = await db.exercises.count()
  if (count > 0) return

  const user = 'demo-user'
  const today = new Date()
  const names = ['Squat','Bench','Deadlift']
  const exercises: Exercise[] = names.map((name)=> ({ id: newId(), user_id: user, name, created_at: nowIso(), updated_at: nowIso(), })) as any
  await db.exercises.bulkPut(exercises)

  const sessions: Session[] = []
  const sets: SetRow[] = []
  for (let d=28; d>=0; d--) {
    const date = new Date(today.getTime() - d*24*3600*1000)
    const sId = newId()
    sessions.push({ id: sId, user_id: user, date: date.toISOString().slice(0,10), created_at: nowIso(), updated_at: nowIso(), notes: '' } as any)
    exercises.forEach((ex, i) => {
      const top = 80 + i*10 + Math.round(Math.random()*10)
      const reps = 3 + (i%2)
      sets.push({ id: newId(), user_id: user, session_id: sId, exercise_id: ex.id, weight: top, reps, rpe: 8, is_warmup: false, created_at: nowIso(), updated_at: nowIso() })
    })
  }
  await db.sessions.bulkPut(sessions)
  await db.sets.bulkPut(sets)
})
