import type { Session } from '@supabase/supabase-js'
import { ref, computed } from 'vue'

// Create shared, module-scoped state
const session = ref<Session | null>(null)
const sessionReady = ref(false)

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const isLoggedIn = computed(() => !!user.value)

  // Prime session once so consumers watching sessionReady can proceed
  if (process.client && !sessionReady.value) {
    supabase.auth.getSession()
      .then(({ data }) => { session.value = data.session })
      .finally(() => { sessionReady.value = true })
  }

  async function getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        session.value = null
        throw error
      }
      session.value = data.session
      return data.session
    } finally {
      sessionReady.value = true
    }
  }

  async function signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Ensure session is kept up-to-date
  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
    sessionReady.value = true
  })

  return {
    supabase,
    user,
    isLoggedIn,
    signInWithMagicLink,
    signOut,
    getSession,
    session,
    sessionReady,
  }
}
