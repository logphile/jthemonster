// plugins/seed.client.ts
import { db } from '~/db/indexed'
import { EXERCISES } from '~/data/exercises'

export default defineNuxtPlugin(async () => {
  const count = await db.exercises.count()
  if (count === 0) {
    await db.exercises.bulkPut(EXERCISES)
    // If you add demo sessions/sets later, generate IDs here with crypto.randomUUID()
  }
})
