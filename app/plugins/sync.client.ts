import { watchEffect } from 'vue'
import { defineNuxtPlugin } from 'nuxt/app'
import { useAuth } from '../composables/useAuth'
import { useSync } from '../composables/useSync'
import { importFromSupabase } from '../composables/useSync'
import { db, openDB } from '~/db/indexed'

export default defineNuxtPlugin(() => {
  const { sessionReady, session } = useAuth()
  const { startSyncLoop, subscribe } = useSync()

  // wait for auth, then start sync once
  let started = false
  watchEffect(() => {
    if (!sessionReady.value) return
    if (session.value && !started) {
      startSyncLoop()
      subscribe() // Supabase postgres_changes subscriptions
      started = true

      // One-time initial import on fresh installs (after clearing site data)
      ;(async () => {
        try {
          await openDB()
          const meta = await (db as any).meta?.get('lastPulledAt')
          const setsCount = await (db as any).sets?.count()
          if (!meta && (!setsCount || setsCount === 0)) {
            const res = await importFromSupabase(730)
            // mark a baseline so incremental pulls switch to updated_at mode
            await (db as any).meta?.put({ key: 'lastPulledAt', value: new Date().toISOString() })
            if (process.dev) console.log('[sync] initial import complete', res)
          }
        } catch (e) {
          console.warn('[sync] initial import skipped/failed', e)
        }
      })()
    }
  })
})
