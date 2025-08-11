// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  // Never run this on server
  if (process.server) return

  // Allow these routes always
  const passthrough = new Set(['/', '/dashboard', '/login', '/auth/callback'])
  if (passthrough.has(to.path)) return
  
  // No further gating for now; add auth checks for protected routes later
  return
})
