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
}

class MonsterDB extends Dexie {
  sessions!: Table<Session, string>
  sets!: Table<SetRecord, string>
  exercises!: Table<ExerciseRecord, string>
  bodyweights!: Table<Bodyweight, string>
}

export const db = new MonsterDB('jthemonster')

// BUMP this integer if you already have a version:
db.version(2).stores({
  sessions: 'id, date, split',
  sets: 'id, sessionId, date, exerciseId, weightLb, reps',
  exercises: 'id, split, bodypart, name',
  bodyweights: 'id, date, weightLb',
})
