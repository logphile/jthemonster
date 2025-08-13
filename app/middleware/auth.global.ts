// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  if (!process.client) return
  const user = useSupabaseUser()

  // Public-only routes
  const PUBLIC = new Set<string>(['/settings', '/login'])

  // Block everything except PUBLIC until signed in
  if (!user.value && !PUBLIC.has(to.path)) {
    return navigateTo('/settings')
  }

  // If signed in, keep them out of public entry routes
  if (user.value && (to.path === '/' || to.path === '/login')) {
    return navigateTo('/dashboard')
  }
})
