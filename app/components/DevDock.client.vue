<script setup lang="ts">
const SHOW_DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEBUG_TOOLS === '1'
const cfg = useRuntimeConfig().public
const route = useRoute()
const query = computed(() => route.query)
const user = useSupabaseUser()
let store: any = null; try { store = useProfileStore() } catch {}
</script>

<template>
  <div v-if="SHOW_DEBUG" class="fixed top-2 right-2 z-[9998] bg-black/80 text-white text-xs rounded p-2 pointer-events-none">
    <div>route: {{ route.fullPath }}</div>
    <div>query: {{ query }}</div>
    <div>supabase.url set: {{ !!cfg?.supabase?.url }}</div>
    <div>user: {{ user ? (user.email || user.id) : 'null' }}</div>
    <div>store: {{ !!store }}</div>
    <div>store.keys: {{ store ? Object.keys(store) : 'none' }}</div>
  </div>
</template>
