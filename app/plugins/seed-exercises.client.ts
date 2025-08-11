// ~/plugins/seed-exercises.client.ts
import { db } from '~/db/indexed'
import { EXERCISES } from '~/data/exercises'

export default defineNuxtPlugin(async () => {
  try {
    const count = await db.exercises.count()
    if (count === 0) {
      await db.exercises.bulkPut(EXERCISES)
      // optional: also create a few demo sessions/sets here
    }
  } catch (e) {
    console.error('seed-exercises failed', e)
  }
})
