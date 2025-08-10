import Dexie, { Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'

export type Exercise = { id: string; user_id: string; name: string; category?: string; created_at: string; updated_at: string }
export type Session = { id: string; user_id: string; date: string; notes?: string; duration_min?: number; created_at: string; updated_at: string }
export type SetRow = { id: string; user_id: string; session_id: string; exercise_id: string; weight: number; reps: number; rpe?: number; is_warmup?: boolean; created_at: string; updated_at: string }
export type OutboxItem = { id: string; table: 'exercises'|'sessions'|'sets'; op: 'insert'|'update'|'delete'; payload: any; ts: number }
export type Meta = { key: 'lastPulledAt'; value: string }

class AppDB extends Dexie {
  exercises!: Table<Exercise, string>
  sessions!: Table<Session, string>
  sets!: Table<SetRow, string>
  outbox!: Table<OutboxItem, string>
  meta!: Table<Meta, string>

  constructor() {
    super('jthemonster')
    this.version(1).stores({
      exercises: 'id, user_id, updated_at',
      sessions: 'id, user_id, date, updated_at',
      sets: 'id, user_id, session_id, exercise_id, updated_at',
      outbox: 'id, table, ts',
      meta: 'key'
    })
  }
}

export const db = new AppDB()

export function nowIso() { return new Date().toISOString() }
export function newId() { return uuidv4() }
