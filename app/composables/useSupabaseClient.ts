import type { SupabaseClient } from '@supabase/supabase-js'

// Delegate to the official @nuxtjs/supabase composable to avoid shadowing/conflicts.
// Keep a compatibility wrapper name in case the app references this util.
export const useSupabaseClientSingleton = () => useSupabaseClient<SupabaseClient>()

// Optional convenience alias if needed elsewhere in the app.
export const useSbClient = () => useSupabaseClient<SupabaseClient>()
