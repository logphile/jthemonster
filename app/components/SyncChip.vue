<template>
  <span
    :class="['inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs',
      'bg-card text-subtext'
    ]">
    <span class="size-2 rounded-full" :class="syncing ? 'bg-accent animate-pulse' : 'bg-success'"></span>
    <span>{{ syncing ? 'Syncing…' : 'Synced' }}</span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, type Ref } from 'vue'
import { useSync } from '~/composables/useSync'

const fallback = { status: ref<'idle'|'syncing'>('idle') }
const { status } = (typeof useSync === 'function' ? useSync() : fallback) as { status: Ref<'idle'|'syncing'> }
const syncing = computed(() => status?.value === 'syncing')
</script>
