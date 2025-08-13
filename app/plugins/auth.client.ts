export default defineNuxtPlugin(async () => {
  // Ensure we only touch browser APIs on client
  if (process.server) return
  const supa = useSupabaseClientSingleton()
  const auth = useAuth()

  // 1) Prime the session before the app paints
  try {
    const { data } = await supa.auth.getSession()
    const session = (data as any)?.session ?? null
    // Directly set states to avoid a second round-trip
    auth.session.value = session
    auth.sessionReady.value = true
    auth.user.value = session?.user ?? null
  } catch (e) {
    // Mark ready even on failure to avoid hanging guards
    auth.session.value = null
    auth.sessionReady.value = true
    auth.user.value = null
  }

  // 2) React to future changes (roles/links recomputed via refreshSession)
  supa.auth.onAuthStateChange(async () => {
    try { await auth.refreshSession() } catch {}
  })
})
