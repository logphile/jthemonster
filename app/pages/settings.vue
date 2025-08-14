<script setup lang="ts">
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
      <div class="mt-4 space-y-3">
        <p class="text-sm opacity-80">
          Auth: <strong>{{ isAuthed ? 'Signed in' : 'Guest' }}</strong>
        </p>
        <p class="text-sm opacity-80">Email: {{ email ?? '—' }}</p>

        <div class="flex items-center gap-3">
          <label class="text-sm">Units</label>
          <select v-model="units" class="border rounded px-2 py-1">
            <option value="lb">lb</option>
            <option value="kg">kg</option>
          </select>
        </div>

        <div v-if="!isAuthed" class="pt-3">
          <p class="text-xs opacity-70">Sign in to sync with Supabase.</p>
          <!-- your magic-link UI can mount here safely -->
        </div>
      </div>
    </ClientOnly>
  </main>
</template>
