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
  const { user } = useAuth()

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

  const canEdit = computed(() => !!user.value)

  async function add(name: string, category?: string) {
    if (!canEdit.value || !user.value) return
    const row: any = { id: newId(), user_id: user.value.id, name, category, created_at: nowIso(), updated_at: nowIso() }
    await db.exercises.put(row)
    if (canEdit.value) await queue({ table: 'exercises', op: 'insert', payload: row })
    await push()
    await load()
  }

  // Map a bodypart to an approximate split key used elsewhere in the app
  function splitFor(bp: string): string {
    if (bp === 'chest' || bp === 'triceps') return 'chestTris'
    if (bp === 'back' || bp === 'biceps') return 'backBis'
    if (bp === 'quads' || bp === 'hamstrings' || bp === 'glutes' || bp === 'calves' || bp === 'legs') return 'legs'
    if (bp === 'shoulders' || bp === 'abs' || bp === 'core') return 'shouldersAbs'
    return ''
  }

  // Create a custom exercise (duplicate guard + offline-first insert + sync queue)
  async function createCustom(payload: { name: string; bodypart: string; equipment?: string | null }) {
    if (!canEdit.value) throw new Error('Not allowed')
    if (!user.value) throw new Error('Missing user')
    const name = (payload.name || '').trim()
    if (name.length < 3) throw new Error('Please enter a longer name.')
    const bp = (payload.bodypart || '').trim()

    // Local duplicate guard (case-insensitive, same bodypart)
    const exists = (list.value || []).some((e: any) =>
      (e?.bodypart || '').trim() === bp && String(e?.name || '').trim().toLowerCase() === name.toLowerCase()
    )
    if (exists) throw new Error('An exercise with that name already exists for this body part.')

    const row: any = {
      id: newId(),
      user_id: user.value.id,
      name,
      bodypart: bp,
      split: splitFor(bp),
      equipment: payload.equipment ?? null,
      created_at: nowIso(),
      updated_at: nowIso(),
    }

    // Write locally for instant UX
    await db.exercises.put(row)
    list.value.push(row)

    // Queue for server sync (RLS may set user_id automatically if default exists)
    await queue({ table: 'exercises', op: 'insert', payload: row })
    await push()
    return row
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

  return { list, load, add, update, remove, createCustom }
})
