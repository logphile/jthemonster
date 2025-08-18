export default defineNuxtPlugin(() => {
  const cfg = (useRuntimeConfig().public as any)?.supabase as { url?: string; key?: string }
  if (!cfg?.url || !cfg?.key) {
    // Do not abort app mount; surface error for diagnostics instead
    // This prevents a blank screen in production if envs were not embedded at build time
    // and allows the rest of the SPA to render.
    console.error('[check-supabase] Missing Supabase config at runtime. Rebuild with NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY.')
  }
})
