// app/middleware/auth.global.ts
import { useSupabaseClientSingleton } from '~/composables/useSupabaseClient'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!process.client) return

  // Make sure the Supabase client initializes so auth plugin can hydrate
  const supa = useSupabaseClientSingleton()
  try { await supa.auth.getSession() } catch {}

  const { user, sessionReady } = useAuth()

  // Wait a microtask for auth plugin to mark sessionReady
  if (!sessionReady.value) {
    await new Promise((r) => setTimeout(r, 0))
  }

  // Only these routes are public
  const PUBLIC = new Set<string>(['/settings', '/login'])

  // Force login for everything else
  if (!user.value && !PUBLIC.has(to.path)) {
    return navigateTo('/settings')
  }

  // If logged in and they hit '/', '/login', or '/settings' intentionally,
  // take them to the dashboard.
  if (user.value && (to.path === '/' || to.path === '/login')) {
    return navigateTo('/dashboard')
  }
})
