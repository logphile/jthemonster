<script setup lang="ts">
import { useSlots } from 'vue'
import { useSafeQuery } from '~/composables/useSafeQuery'

const route = useRoute()
const $q = useSafeQuery()
onMounted(() => {
  console.log('[SETTINGS] route.query raw:', route.query)
  console.log('[SETTINGS] safe query:', $q.value)
  console.log('[SETTINGS] slots on this component:', Object.keys(useSlots?.() || {}))
})
import { useSafeUser } from '~/composables/useSafeUser'
import { useProfileStore } from '~/stores/profile'

const { email, isAuthed } = useSafeUser()
const store = useProfileStore()
const units = computed({
  get: () => store.settings?.units ?? 'lb',
  set: (v: 'lb' | 'kg') => store.setUnits(v),
})
onMounted(() => console.log('[settings] mounted'))
</script>

<template>
  <main class="p-4">
    <h1 class="text-xl font-semibold">Settings</h1>

    <ClientOnly>
      <!-- Authenticated View -->
      <div v-if="isAuthed" class="mt-4 space-y-3">
        <p class="text-sm opacity-80">
          Auth: <strong>Signed in</strong>
        </p>
        <p class="text-sm opacity-80">Email: {{ email ?? '—' }}</p>

        <div class="flex items-center gap-3">
          <label class="text-sm">Units</label>
          <select v-model="units" class="border rounded px-2 py-1">
            <option value="lb">lb</option>
            <option value="kg">kg</option>
          </select>
        </div>
      </div>

      <!-- Guest View -->
      <div v-else class="mt-4 space-y-3">
        <p class="text-sm opacity-80">Auth: <strong>Guest</strong></p>
        <div class="pt-3">
          <p class="text-xs opacity-70">Sign in to sync with Supabase.</p>
          <!-- your magic-link UI can mount here safely -->
        </div>
      </div>

      <template #fallback>
        <!-- Loading state -->
        <div class="mt-4 space-y-3 animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </template>
    </ClientOnly>
  </main>
</template>
