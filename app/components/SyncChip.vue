<template>
  <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-card text-subtext border border-border/60">
    <span class="size-2 rounded-full" :class="isSyncing ? 'bg-accent animate-pulse' : 'bg-success'"></span>
    <span>{{ isSyncing ? 'Syncing…' : 'Synced' }}</span>
  </span>
  
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Try to use the real composable if present; otherwise idle.
let status = ref<'idle'|'syncing'>('idle')
try {
  // nuxt auto-imports composables via #imports; dynamic import keeps it safe if missing
  const mod = await import('#imports').catch(() => null)
  if (mod && typeof (mod as any).useSync === 'function') {
    const s = (mod as any).useSync().status
    if (s) status = s
  }
} catch {}

const isSyncing = computed(() => status.value === 'syncing')
</script>
