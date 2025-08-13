// ~/db/indexed.ts
import Dexie, { type Table } from 'dexie'

export interface Session {
  id: string            // nanoid
  date: string          // 'YYYY-MM-DD'
  split?: string        // SplitKey
  note?: string
}

export interface SetRecord {
  id: string            // nanoid
  sessionId: string
  date: string          // duplicate for range queries
  exerciseId: string
  reps: number
  weightLb: number
  rpe?: number
  unit?: 'lb' | 'kg'    // optional, additive
}

export interface ExerciseRecord {
  id: string            // slug
  name: string
  split: string         // SplitKey
  bodypart: string
}

export interface Bodyweight {
  id: string            // `${date}`
  date: string          // 'YYYY-MM-DD'
  weightLb: number
  unit?: 'lb' | 'kg'    // optional, additive
}

class MonsterDB extends Dexie {
  sessions!: Table<Session, string>
  sets!: Table<SetRecord, string>
  exercises!: Table<ExerciseRecord, string>
  bodyweights!: Table<Bodyweight, string>
  // additive stores for sync/metadata
  outbox!: Table<any, string>
  meta!: Table<any, string>
}

export const db = new MonsterDB('jthemonster')

// Schema versioning — bump carefully when adding indexes/stores
db.version(3)
  .stores({
    sessions: 'id, date, split',
    sets: 'id, sessionId, date, exerciseId, weightLb, reps',
    exercises: 'id, split, bodypart, name',
    bodyweights: 'id, date, weightLb',
    // new additive stores
    outbox: '++_id, ts, table, op',
    meta: 'key',
  })
  .upgrade((_tx) => {
    // No-op upgrade to ensure smooth migration from older versions
    // Place any backfills/transforms here if needed in the future
    return
  })

// Helper to proactively open DB and surface errors to caller
export async function openDB() {
  try {
    await db.open()
    return db
  } catch (e) {
    console.error('[db] Dexie open failed', e)
    throw e
  }
}
