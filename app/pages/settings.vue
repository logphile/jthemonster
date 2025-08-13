<script setup lang="ts">
import { importFromSupabase } from '~/composables/useSync'
import { useSupabaseClientSingleton } from '~/composables/useSupabaseClient'

const syncing = ref(false)
const last = ref<{ imported:boolean; sessions:number; sets:number; bodyweights:number; reason?:string }|null>(null)
const err = ref<string|null>(null)

// Auth state and client for Option B
const { user } = useAuth()
const supabase = ((globalThis as any).useSupabaseClient?.() ?? useSupabaseClientSingleton()) as any
const email = ref('')
const sending = ref(false)
const sentMsg = ref('')

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

async function onSendMagicLink() {
  sending.value = true
  sentMsg.value = ''
  err.value = null
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value.trim(),
      options: { emailRedirectTo: location.origin + '/settings' }
    })
    if (error) throw error
    sentMsg.value = 'Check your email for the sign-in link.'
  } catch (e:any) {
    console.error('[settings] magic-link error', e)
    err.value = e?.message || String(e)
  } finally {
    sending.value = false
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

    <!-- When not signed in: simple magic-link panel (Option B) -->
    <section v-if="!user" class="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
      <h2 class="text-base font-medium mb-2">Sign in</h2>
      <p class="text-sm opacity-70 mb-4">Enter your email and we’ll send you a magic link.</p>
      <form class="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]" @submit.prevent="onSendMagicLink">
        <input
          v-model="email"
          type="email"
          inputmode="email"
          placeholder="you@example.com"
          class="h-11 rounded-xl bg-zinc-900/70 px-3 w-full outline-none"
          required
        />
        <button
          type="submit"
          class="h-11 rounded-xl px-4 bg-gradient-to-br from-firepink-600 to-firepink-700 text-white whitespace-nowrap disabled:opacity-60"
          :disabled="sending || !email"
        >
          {{ sending ? 'Sending…' : 'Send magic link' }}
        </button>
      </form>
      <p v-if="sentMsg" class="mt-3 text-sm text-green-400">{{ sentMsg }}</p>
      <p v-if="err" class="mt-2 text-sm text-amber-400">{{ err }}</p>
    </section>

    <!-- When signed in: show Data & Sync section -->
    <section v-else class="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
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
