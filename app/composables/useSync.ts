import { db } from '~/db/indexed'
import { subDays } from 'date-fns'
import { useSupabaseClientSingleton } from './useSupabaseClient'
import { useAuth } from './useAuth'

export function useSync() {
  const supabase = useSupabaseClientSingleton()
  const { athleteUserId, sessionReady } = useAuth()

  async function queue(item: any) {
    // outbox table may not exist in current schema; use loose typing
    await (db as any).outbox?.add({ id: crypto.randomUUID(), ts: Date.now(), ...item })
  }

  async function push() {
    const items = await (db as any).outbox?.orderBy('ts').toArray() ?? []
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
      if (!res.error) await (db as any).outbox?.delete(it.id)
    }
  }

  async function pull(limit = 1000) {
    if (!sessionReady.value || !athleteUserId.value) return
    const { data: m } = await (db as any).meta?.get('lastPulledAt') ?? { data: undefined }
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
    await (db as any).meta?.put({ key: 'lastPulledAt', value: maxTs })
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

// Lightweight importer: Supabase -> Dexie (last N days)
// Usage: const res = await importFromSupabase(60)
export async function importFromSupabase(days = 60) {
  // Use app's singleton Supabase client
  const supabase = useSupabaseClientSingleton()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { imported: false as const, reason: 'no-user' as const, sessions: 0, sets: 0, bodyweights: 0 }

  const end = new Date()
  const startISO = subDays(end, days - 1).toISOString().slice(0, 10)
  const endISO   = end.toISOString().slice(0, 10)

  // sessions
  const { data: sessions, error: sErr } = await supabase
    .from('sessions').select('id,date,split')
    .gte('date', startISO).lte('date', endISO).order('date')
  if (sErr) throw sErr

  await db.sessions.bulkPut((sessions ?? []).map((s: any) => ({
    id: s.id, date: s.date, split: s.split ?? null
  })))
  const dateBySession: Record<string, string> = Object.fromEntries((sessions ?? []).map((s: any) => [s.id, s.date]))

  // sets
  let setsCount = 0
  const sids = (sessions ?? []).map((s: any) => s.id)
  if (sids.length) {
    const { data: sets, error: eErr } = await supabase
      .from('sets')
      .select('id, session_id, exercise_id, reps, weight_lb, weight, rpe')
      .in('session_id', sids)
    if (eErr) throw eErr

    await db.sets.bulkPut((sets ?? []).map((r: any) => ({
      id: r.id,
      sessionId: r.session_id,
      date: dateBySession[r.session_id] ?? endISO,
      exerciseId: r.exercise_id,
      reps: r.reps ?? 0,
      weightLb: Number((r.weight_lb ?? r.weight) ?? 0),
      rpe: r.rpe ?? null
    })))
    setsCount = (sets?.length ?? 0)
  }

  // bodyweights
  const { data: bws, error: bErr } = await supabase
    .from('bodyweights').select('date,weight')
    .gte('date', startISO).lte('date', endISO)
  if (bErr) throw bErr

  await db.bodyweights.bulkPut((bws ?? []).map((b: any) => ({
    id: b.date, date: b.date, weightLb: Number(b.weight)
  })))

  const result = { imported: true as const, sessions: sessions?.length ?? 0, sets: setsCount, bodyweights: (bws?.length ?? 0) }
  // Notify UI to refresh charts/calendars immediately after import
  if (process.client) {
    try { window.dispatchEvent(new CustomEvent('jt:sync-finished', { detail: result })) } catch {}
  }
  return result
}
