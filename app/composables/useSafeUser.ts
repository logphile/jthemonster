import type { Ref } from 'vue'
import { computed } from 'vue'
import type { User } from '@supabase/supabase-js'

/** Always‑safe accessors for Supabase user on client */
export function useSafeUser() {
  const userRef = useSupabaseUser() as Ref<User | null>
  const id = computed(() => userRef.value?.id ?? null)
  const email = computed(() => userRef.value?.email ?? null)
  const isAuthed = computed(() => !!userRef.value)
  return { userRef, id, email, isAuthed }
}
