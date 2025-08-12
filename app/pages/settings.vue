<script setup lang="ts">
import { importFromSupabase } from '~/composables/useSync'

const syncing = ref(false)
const last = ref<{ imported:boolean; sessions:number; sets:number; bodyweights:number; reason?:string }|null>(null)
const err = ref<string|null>(null)

onMounted(() => console.log('[settings] mounted'))

async function onSyncNow() {
  syncing.value = true
  last.value = null
  err.value = null
  try {
    const res = await importFromSupabase(60)
    console.log('[settings] sync result:', res)
    last.value = res
    if (!res.imported && res.reason === 'no-user') {
      err.value = 'You are not signed in. Please log in and try again.'
    }
  } catch (e:any) {
    console.error('[settings] sync error', e)
    err.value = e?.message || String(e)
  } finally {
    syncing.value = false
  }
}
</script>

<template>
  <main class="min-h-dvh px-4 py-6 space-y-6">
    <!-- Mini header with back link -->
    <div class="flex items-center gap-3">
      <NuxtLink to="/dashboard" class="text-sm px-3 py-1 rounded-full bg-zinc-800/70 border border-zinc-700 hover:bg-zinc-700">
        ← Back
      </NuxtLink>
      <h1 class="text-xl font-semibold">Settings</h1>
    </div>

    <section class="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
      <h2 class="text-base font-medium mb-2">Data & Sync</h2>
      <p class="text-sm opacity-70 mb-4">
        Pull the last 60 days from Supabase into local storage for a fast UI.
      </p>
      <button
        class="px-4 py-2 rounded-full bg-rose-600 text-white disabled:opacity-60"
        :disabled="syncing"
        @click="onSyncNow"
      >
        {{ syncing ? 'Syncing…' : 'Sync Now' }}
      </button>

      <p v-if="last" class="mt-3 text-sm opacity-90">
        <template v-if="last.imported">
          Imported: {{ last.sessions }} sessions, {{ last.sets }} sets, {{ last.bodyweights }} weigh-ins.
        </template>
        <template v-else>
          Sync skipped: {{ last.reason }}
        </template>
      </p>

      <p v-if="err" class="mt-2 text-sm text-amber-400">
        {{ err }}
      </p>
    </section>
  </main>
</template>
