// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on client; app is SPA
  if (process.server) return
  const { session, sessionReady, refreshSession } = useAuth()

  // Ensure session computed before guarding
  if (!sessionReady.value) {
    try { await refreshSession() } catch {}
  }

  // Allowed public routes
  const allow = new Set<string>(['/', '/login', '/settings', '/auth/callback'])
  if (!session.value && !allow.has(to.path)) {
    return navigateTo('/settings')
  }
  return
})
