// plugins/seed.client.ts
import { db, openDB } from '~/db/indexed'
import { EXERCISES } from '~/data/exercises'

export default defineNuxtPlugin(async () => {
  await openDB()
  const count = await db.exercises.count()
  if (count === 0) {
    const now = new Date().toISOString()
    await db.exercises.bulkPut(EXERCISES.map(x => ({ ...x, created_at: now, updated_at: now })))
    // If you add demo sessions/sets later, generate IDs here with crypto.randomUUID()
  }
})
