import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../db/indexed'
const nowIso = () => new Date().toISOString()
const newId = () => crypto.randomUUID()
import { useSync } from '../composables/useSync'
import { useAuth } from '../composables/useAuth'

export const useSets = defineStore('sets', () => {
  const list = ref<any[]>([])
  const { queue, push } = useSync()
  const { user } = useAuth()
  const supabase = useSupabaseClient()

  async function load(sessionId?: string) {
    try {
      if (sessionId) {
        // Our Dexie schema uses camelCase
        // @ts-ignore
        list.value = await db.sets.where('sessionId').equals(sessionId).toArray()
      } else {
        // Fallback: sort by date desc
        list.value = (await db.sets.orderBy('date').reverse().toArray()) as any[]
      }
    } catch {
      list.value = []
    }
  }

  const canEdit = computed(() => !!user.value)

  async function add(row: any) {
    if (!canEdit.value || !user.value) return
    const payload: any = { ...row, user_id: user.value.id, id: newId(), created_at: nowIso(), updated_at: nowIso() }
    await db.sets.put(payload)
    if (canEdit.value) await queue({ table: 'sets', op: 'insert', payload })
    await push(); await load()
  }

  async function update(id: string, patch: any) {
    if (!canEdit.value) return
    const row = await db.sets.get(id)
    if (!row) return
    const updated = { ...row, ...patch, updated_at: nowIso() }
    await db.sets.put(updated)
    if (canEdit.value) await queue({ table: 'sets', op: 'update', payload: updated })
    await push(); await load()
  }

  async function remove(id: string) {
    if (!canEdit.value) return
    const row = await db.sets.get(id)
    await db.sets.delete(id)
    if (canEdit.value) await queue({ table: 'sets', op: 'delete', payload: { id } })
    await push(); await load()
  }

  async function getProgressSeries(exerciseId: string) {
    // Prefer local (offline-safe)
    const sets = await db.sets.where('exerciseId').equals(exerciseId).toArray()

    // Aggregate per date (ignore warmups)
    const byDate: Record<string, { top: number; est: number; vol: number }> = {}
    for (const s of sets) {
      if ((s as any).is_warmup) continue
      const createdOrUpdated = new Date((s as any).created_at || (s as any).updated_at || Date.now())
      const baseDate = (s as any).date ? new Date((s as any).date) : (isNaN(createdOrUpdated.getTime()) ? new Date() : createdOrUpdated)
      const key = baseDate.toISOString().slice(0, 10)
      const weight = Number((s as any).weight || 0)
      const reps = Number((s as any).reps || 0)
      const est = weight * (1 + reps / 30)
      const cur = byDate[key] || { top: 0, est: 0, vol: 0 }
      cur.top = Math.max(cur.top, weight)
      cur.est = Math.max(cur.est, est)
      cur.vol += weight * reps
      byDate[key] = cur
    }
    let localSeries = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, top: v.top, est1rm: v.est, volume: v.vol }))

    // If online & authed, try server view for accuracy
    try {
      if (user.value) {
        const targetUser = user.value.id
        if (!targetUser) return localSeries
        const { data, error } = await supabase
          .from('exercise_daily')
          .select('date, top_set_weight, est_1rm, total_volume, user_id, exercise_id')
          .eq('exercise_id', exerciseId)
          .eq('user_id', targetUser as string)
          .order('date', { ascending: true })
        if (!error && data && data.length) {
          localSeries = data.map((r: any) => ({
            date: r.date,
            top: Number(r.top_set_weight || 0),
            est1rm: Number(r.est_1rm || 0),
            volume: Number(r.total_volume || 0),
          }))
        }
      }
    } catch (_) {
      /* keep local fallback */
    }

    return localSeries
  }

  return { list, load, add, update, remove, getProgressSeries }
})
