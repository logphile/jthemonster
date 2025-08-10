import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, type Session, nowIso, newId } from '../db/indexed'
import { useSync } from '../composables/useSync'
import { useAuth } from '../composables/useAuth'

export const useSessions = defineStore('sessions', () => {
  const list = ref<Session[]>([])
  const { queue, push } = useSync()
  const { athleteUserId, canWrite } = useAuth()

  async function load() {
    list.value = await db.sessions.orderBy('date').reverse().toArray()
  }

  const canEdit = computed(() => canWrite.value)

  async function add(date: string, notes?: string, duration_min?: number) {
    if (!canEdit.value) return
    if (!athleteUserId.value) return
    const row: Session = { id: newId(), user_id: athleteUserId.value, date, notes, duration_min, created_at: nowIso(), updated_at: nowIso() }
    await db.sessions.put(row)
    if (canEdit.value) await queue({ table: 'sessions', op: 'insert', payload: row })
    await push(); await load()
  }

  async function update(id: string, patch: Partial<Session>) {
    if (!canEdit.value) return
    const row = await db.sessions.get(id)
    if (!row) return
    const updated = { ...row, ...patch, updated_at: nowIso() }
    await db.sessions.put(updated)
    if (canEdit.value) await queue({ table: 'sessions', op: 'update', payload: updated })
    await push(); await load()
  }

  async function remove(id: string) {
    if (!canEdit.value) return
    await db.sessions.delete(id)
    if (canEdit.value) await queue({ table: 'sessions', op: 'delete', payload: { id } })
    await push(); await load()
  }

  return { list, load, add, update, remove }
})
