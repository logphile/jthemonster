import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../db/indexed'
const nowIso = () => new Date().toISOString()
const newId = () => crypto.randomUUID()
import { useSync } from '../composables/useSync'
import { useAuth } from '../composables/useAuth'

export const useExercises = defineStore('exercises', () => {
  const list = ref<any[]>([])
  const { queue, push } = useSync()
  const { athleteUserId, canWrite } = useAuth()

  async function load() {
    try {
      // Prefer indexed order by name; seed may not include updated_at
      list.value = await db.exercises.orderBy('name').toArray()
      if (!list.value.length) {
        // Fallback if seed hasn’t run yet
        list.value = await db.exercises.toArray()
      }
    } catch (e) {
      console.error('[exercises.load]', e)
      // Last-ditch so the UI doesn’t stay empty
      list.value = await db.exercises.toArray()
    }
  }

  const canEdit = computed(() => canWrite.value)

  async function add(name: string, category?: string) {
    if (!canEdit.value) return
    if (!athleteUserId.value) return
    const row: any = { id: newId(), user_id: athleteUserId.value, name, category, created_at: nowIso(), updated_at: nowIso() }
    await db.exercises.put(row)
    if (canEdit.value) await queue({ table: 'exercises', op: 'insert', payload: row })
    await push()
    await load()
  }

  async function update(id: string, patch: any) {
    if (!canEdit.value) return
    const row = await db.exercises.get(id)
    if (!row) return
    const updated = { ...row, ...patch, updated_at: nowIso() }
    await db.exercises.put(updated)
    if (canEdit.value) await queue({ table: 'exercises', op: 'update', payload: updated })
    await push(); await load()
  }

  async function remove(id: string) {
    if (!canEdit.value) return
    await db.exercises.delete(id)
    if (canEdit.value) await queue({ table: 'exercises', op: 'delete', payload: { id } })
    await push(); await load()
  }

  return { list, load, add, update, remove }
})
