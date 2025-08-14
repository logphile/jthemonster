// app/scripts/check-env.cjs
const missing = []
if (!process.env.NUXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL)
  missing.push('NUXT_PUBLIC_SUPABASE_URL or SUPABASE_URL')
if (
  !process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.SUPABASE_ANON_KEY &&
  !process.env.SUPABASE_KEY
)
  missing.push('NUXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY/SUPABASE_KEY')

if (missing.length) {
  console.error('[check-env] Missing required env(s):\n - ' + missing.join('\n - '))
  process.exit(1)
} else {
  console.log('[check-env] Supabase envs detected.')
}
