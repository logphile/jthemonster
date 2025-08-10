import { db, type OutboxItem } from '~/db/indexed'
import { useSupabaseClientSingleton } from './useSupabaseClient'
import { useAuth } from './useAuth'

export function useSync() {
  const supabase = useSupabaseClientSingleton()
  const { athleteUserId, sessionReady } = useAuth()

  async function queue(item: Omit<OutboxItem,'id'|'ts'>) {
    await db.outbox.add({ id: crypto.randomUUID(), ts: Date.now(), ...item })
  }

  async function push() {
    const items = await db.outbox.orderBy('ts').toArray()
    for (const it of items) {
      const table = it.table
      const payload = it.payload
      let res
      if (it.op === 'insert') {
        res = await supabase.from(table).insert(payload)
      } else if (it.op === 'update') {
        res = await supabase.from(table).upsert(payload)
      } else {
        res = await supabase.from(table).delete().eq('id', payload.id)
      }
      if (!res.error) await db.outbox.delete(it.id)
    }
  }

  async function pull(limit = 1000) {
    if (!sessionReady.value || !athleteUserId.value) return
    const { data: m } = await db.meta.get('lastPulledAt')
    const since = (m as any)?.value ?? '1970-01-01T00:00:00Z'
    const tables = ['exercises','sessions','sets'] as const
    const updates: any[] = []
    for (const t of tables) {
      let q = supabase.from(t).select('*').gt('updated_at', since).limit(limit)
      // filter by user scope if table has user_id (assumed for our schema)
      q = (q as any).eq('user_id', athleteUserId.value)
      const { data, error } = await q
      if (!error && data) updates.push({ t, rows: data })
    }
    let maxTs = since
    await db.transaction('rw', db.exercises, db.sessions, db.sets, async () => {
      for (const u of updates) {
        for (const row of u.rows) {
          maxTs = maxTs > row.updated_at ? maxTs : row.updated_at
          await (db as any)[u.t].put(row)
        }
      }
    })
    await db.meta.put({ key: 'lastPulledAt', value: maxTs })
  }

  function subscribe() {
    const channels = ['exercises','sessions','sets'].map(t =>
      supabase.channel(`realtime:${t}`).on('postgres_changes', { event: '*', schema: 'public', table: t }, async () => {
        await pull()
      }).subscribe()
    )
    return { unsubscribe: () => channels.forEach(c => supabase.removeChannel(c)) }
  }

  function startSyncLoop() {
    if (process.client) {
      const tick = async () => { try { await push(); await pull(); } catch (e) { /* noop */ } }
      window.addEventListener('online', tick)
      document.addEventListener('visibilitychange', () => { if (!document.hidden) tick() })
      setInterval(tick, 15000)
      tick()
    }
  }

  return { queue, push, pull, subscribe, startSyncLoop }
}
