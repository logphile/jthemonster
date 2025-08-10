// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  // Never run this on server
  if (process.server) return

  // Allow these routes always
  const passthrough = new Set(['/welcome', '/login', '/auth/callback'])
  if (passthrough.has(to.path)) return

  // One-per-login welcome gate (CLIENT ONLY)
  const KEY = 'jt_welcome_v1'
  try {
    const seen = localStorage.getItem(KEY)
    console.debug('[auth.global] seen?', !!seen, 'route:', to.path)
    if (!seen) {
      // Go show the welcome screen
      return navigateTo('/welcome')
    }
  } catch (e) {
    console.warn('[auth.global] localStorage error', e)
    // If storage borks, fail open so we don't black-screen
    return
  }
})
