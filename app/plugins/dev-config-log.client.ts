export default defineNuxtPlugin(() => {
  if (import.meta.dev) {
    const pub = useRuntimeConfig().public as any
    const cfg = pub?.supabase || {}
    // Only log presence booleans to avoid leaking values
    console.debug('[dev-config-log] Supabase cfg (public):', {
      urlSet: !!cfg.url,
      keySet: !!cfg.key,
    })
  }
})
