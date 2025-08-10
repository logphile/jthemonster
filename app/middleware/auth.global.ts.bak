import { watch } from 'vue'
import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuth } from '../composables/useAuth'
// Redirect unauthenticated users to /login; allow /login itself
export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return
  const { sessionReady, session } = useAuth()
  // wait until we know auth state
  if (!sessionReady.value) {
    await new Promise(r => {
      const stop = watch(sessionReady, v => v && (stop(), r(null)))
    })
  }
  const isAuthed = !!session.value
  if (!isAuthed && to.path !== '/login') return navigateTo('/login')
  if (isAuthed && to.path === '/login') return navigateTo('/')
})
