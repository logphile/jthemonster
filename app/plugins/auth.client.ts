export default defineNuxtPlugin(async () => {
  // Ensure we only touch browser APIs on client
  if (process.server) return
  const supa = useSupabaseClient()
  const { getSession } = useAuth()

  // Prime session cache once; state is derived via useSupabaseUser()
  try { await getSession() } catch {}

  // React to future changes (components can watch useSupabaseUser())
  supa.auth.onAuthStateChange(async () => { try { await getSession() } catch {} })
})
