// Runs on every route change (SSR is off in this app)
import { useSupabaseClientSingleton } from '../composables/useSupabaseClient'

export default defineNuxtRouteMiddleware(async (to) => {
  // Never block auth pages themselves
  if (to.path === '/login' || to.path === '/welcome') return

  const supabase = useSupabaseClientSingleton()
  const { data } = await supabase.auth.getSession()
  const session = data.session

  // Not logged in? go to /login
  if (!session) return navigateTo('/login')

  // Show welcome once per session token
  const sig = (session.access_token || '').slice(-24) || 'anon'
  const key = `jt_welcome_${sig}`

  if (process.client && !localStorage.getItem(key)) {
    return navigateTo('/welcome')
  }
})
