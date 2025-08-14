// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  if (!process.client) return
  const user = useSupabaseUser()
  const isLoggedIn = computed(() => !!user.value)

  // Public-only routes
  const PUBLIC = new Set<string>(['/settings', '/login'])

  // Block everything except PUBLIC until signed in
  if (!isLoggedIn.value && !PUBLIC.has(to.path)) {
    return navigateTo('/settings')
  }

  // If signed in, keep them out of public entry routes
  if (isLoggedIn.value && (to.path === '/' || to.path === '/login')) {
    return navigateTo('/dashboard')
  }
})
