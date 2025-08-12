import type { User } from '@supabase/supabase-js'
import { useSupabaseClientSingleton } from './useSupabaseClient'
import { computed } from 'vue'
import { useState, useRuntimeConfig } from 'nuxt/app'

export function useAuth() {
  const supabase = useSupabaseClientSingleton()
  // session + readiness state
  const session = useState<{ user: User } | null>('auth:session', () => null)
  const sessionReady = useState<boolean>('auth:sessionReady', () => false)
  // centralized nullable user
  const user = useState<User | null>('user', () => null)

  // role/permission linkage
  const role = useState<'athlete' | 'coach' | null>('auth:role', () => null)
  const athleteUserId = useState<string | null>('auth:athleteUserId', () => null)
  const coachPermission = useState<'read' | 'write' | null>('auth:coachPermission', () => null)
  const canWrite = computed(() => role.value === 'athlete' || (role.value === 'coach' && coachPermission.value === 'write'))

  async function refreshSession() {
    const { data } = await supabase.auth.getSession()
    session.value = (data.session as any) ?? null
    sessionReady.value = true
    user.value = (session.value?.user as User | undefined) ?? null

    // reset auth-derived fields
    role.value = null
    athleteUserId.value = null
    coachPermission.value = null

    // if no active session, we're done
    const currUser = session.value?.user as User | undefined
    if (!currUser) return

    // fetch role from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', currUser.id)
      .maybeSingle()
    role.value = (profile?.role as any) ?? null

    if (role.value === 'coach') {
      // fetch linked athlete + permission
      const { data: ac } = await supabase
        .from('athlete_coaches')
        .select('athlete_user_id, permission')
        .eq('coach_user_id', currUser.id)
        .limit(1)
        .maybeSingle()
      athleteUserId.value = ac?.athlete_user_id ?? null
      coachPermission.value = (ac?.permission as 'read' | 'write' | undefined) ?? null
    } else {
      // athlete role defaults to self and write
      athleteUserId.value = currUser.id
      coachPermission.value = 'write'
    }
  }

  // direct user refresh (centralized user lookup)
  async function refreshUser() {
    const { data } = await supabase.auth.getUser()
    user.value = data?.user ?? null
    return user.value
  }

  async function login(email: string) {
    const runtime = useRuntimeConfig()
    const origin = (typeof window !== 'undefined' && window.location?.origin)
      ? window.location.origin
      : (runtime.public.siteUrl || 'http://localhost:3000')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: origin },
    })
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
    session.value = null
    sessionReady.value = true
    user.value = null
    role.value = null
    athleteUserId.value = null
    coachPermission.value = null
  }

  // listen to auth changes (client only)
  if (typeof window !== 'undefined') {
    supabase.auth.onAuthStateChange(() => refreshSession())
    // initial load
    if (!sessionReady.value) refreshSession()
  }

  return { user, refreshUser, session, sessionReady, role, athleteUserId, coachPermission, canWrite, login, logout, refreshSession }
}
