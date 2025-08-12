// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return
  const { user, refreshUser } = useAuth()
  if (!user.value) {
    try { await refreshUser() } catch {}
  }

  // Allow these routes always (no redirects here; guard pages handle themselves)
  const passthrough = new Set(['/', '/dashboard', '/login', '/auth/callback'])
  if (passthrough.has(to.path)) return
  return
})
