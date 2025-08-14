<script setup lang="ts">
const show = ref(false)
const cfg = useRuntimeConfig().public
const route = useRoute()
const user = useSupabaseUser()

// Safe computed access to route query to prevent _s reactivity errors
const routeQuery = computed(() => route.query || {})

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
      <pre>user: {{ user ? (user.email || user.id) : 'null' }}</pre>
      <pre>store available: {{ !!store }}</pre>
      <pre>store keys: {{ store ? Object.keys(store).slice(0, 5) : 'none' }}</pre>
    </div>
  </div>
</template>
