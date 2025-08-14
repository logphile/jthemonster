<script setup lang="ts">
import { useSafeQuery } from '~/composables/useSafeQuery'
const show = ref(false)
const cfg = useRuntimeConfig().public
const route = useRoute()
const user = useSupabaseUser()
const safeUserDisplay = computed(() => user.value ? (user.value.email || user.value.id) : 'null')
const routeQuery = useSafeQuery()

let store: any = null
try { 
  // Try to get any available store - adjust store name as needed
  const { useWorkoutStore } = await import('~/stores/workout')
  store = useWorkoutStore()
} catch {
  // Store not available or doesn't exist
}
</script>

<template>
  <div class="fixed bottom-2 right-2 z-[9998]">
    <button class="rounded bg-black/80 text-white text-xs px-2 py-1" @click="show = !show">
      {{ show ? '×' : '•' }} DBG
    </button>
    <div v-if="show" class="mt-2 w-[360px] max-h-[60vh] overflow-auto rounded bg-black/80 p-3 text-white text-xs">
      <pre>route: {{ route.fullPath }}</pre>
      <pre>query: {{ routeQuery }}</pre>
      <pre>supabase.url set: {{ !!cfg?.supabase?.url }}</pre>
      <pre>user: {{ safeUserDisplay }}</pre>
      <pre>store available: {{ !!store }}</pre>
      <pre>store keys: {{ store ? Object.keys(store).slice(0, 5) : 'none' }}</pre>
    </div>
  </div>
</template>
