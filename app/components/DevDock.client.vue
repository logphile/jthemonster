<script setup lang="ts">
const cfg = useRuntimeConfig().public
const route = useRoute()
const query = useSafeQuery()
const user = useSupabaseUser()
let store: any = null; try { store = useProfileStore() } catch {}
</script>

<template>
  <div class="fixed top-2 right-2 z-[9998] bg-black/80 text-white text-xs rounded p-2">
    <div>route: {{ route.fullPath }}</div>
    <div>query: {{ query }}</div>
    <div>supabase.url set: {{ !!cfg?.supabase?.url }}</div>
    <div>user: {{ user?.value ? (user.value.email || user.value.id) : 'null' }}</div>
    <div>store: {{ !!store }}</div>
    <div>store.keys: {{ store ? Object.keys(store) : 'none' }}</div>
  </div>
</template>
