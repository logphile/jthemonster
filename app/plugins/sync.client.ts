import { watchEffect } from 'vue'
import { defineNuxtPlugin } from 'nuxt/app'
import { useAuth } from '../composables/useAuth'
import { useSync } from '../composables/useSync'

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
    }
  })
})
