import type { Session } from '@supabase/supabase-js'
import { computed } from 'vue'

export const useAuth = () => {
  // From @nuxtjs/supabase (auto-imported)
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const isLoggedIn = computed(() => !!user.value)

  async function signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async function getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  }

  return { supabase, user, isLoggedIn, signInWithMagicLink, signOut, getSession }
}
