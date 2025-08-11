import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from 'nuxt/app'

let _client: SupabaseClient | null = null

export function useSupabaseClientSingleton() {
  if (_client) return _client
  const config = useRuntimeConfig()
  const url = String(
    (config.public as any).supabaseUrl || (config.public as any).NUXT_PUBLIC_SUPABASE_URL || ''
  )
  const key = String(
    (config.public as any).supabaseAnonKey || (config.public as any).NUXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  if (!url || !key) {
    console.warn('Supabase URL/Key missing. Did you set .env?')
  }
  _client = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  return _client
}
