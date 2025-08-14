export default defineNuxtPlugin(() => {
  const cfg = (useRuntimeConfig().public as any)?.supabase as { url?: string; key?: string }
  if (!cfg?.url || !cfg?.key) {
    throw new Error('Supabase config missing at runtime. Rebuild with SUPABASE_URL and ANON key.')
  }
})
