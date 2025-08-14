export default defineNuxtPlugin(() => {
  if (import.meta.dev) {
    const pub = useRuntimeConfig().public as any
    // Only log minimal info to avoid leaking keys
    console.debug('[dev-config-log] Supabase cfg (public):', {
      url: pub?.supabaseUrl,
      hasKey: !!pub?.supabaseAnonKey,
    })
  }
})
