<script setup lang="ts">
/**
 * Crash-proof Settings page:
 * - No direct route.query access
 * - No slot calls
 * - All state has safe defaults
 * - Works when user is null on first paint
 */

import { useSync } from '~/composables/useSync'
import { importFromSupabase } from '~/composables/useSync'
const supabase = useSupabaseClient()
const userRef = useSupabaseUser()

// safe user accessors
const userEmail = computed(() => userRef?.value?.email ?? '')
const isAuthed  = computed(() => !!userRef?.value)

// Pinia store is optional: guard it so page never explodes if store init lags
let store: any = null
try { store = useProfileStore() } catch { store = null }
const units = computed<'lb' | 'kg'>({ 
  get: () => (store?.settings?.units ?? 'lb') as 'lb' | 'kg',
  set: (v) => { if (store?.setUnits) store.setUnits(v) }
})

// Magic-link form
const emailInput = ref(userEmail.value || '')
const sending = ref(false)
const message = ref<string | null>(null)
const errorMsg = ref<string | null>(null)

async function sendMagicLink () {
  errorMsg.value = null
  message.value = null
  const email = emailInput.value?.trim()
  if (!email) { errorMsg.value = 'Enter your email.'; return }
  try {
    sending.value = true
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) throw error
    message.value = 'Magic link sent. Check your inbox.'
  } catch (e: any) {
    errorMsg.value = e?.message || 'Failed to send magic link.'
  } finally {
    sending.value = false
  }
}

onMounted(() => console.log('[settings] mounted OK'))

// Sync Now
const { push, pull } = useSync()
const syncing = ref(false)
const syncMsg = ref<string | null>(null)
const syncErr = ref<string | null>(null)
async function syncNow() {
  const { $toast } = useNuxtApp()
  syncing.value = true
  syncMsg.value = null
  syncErr.value = null
  try {
    await push()
    const res = await importFromSupabase(365)
    await pull()
    syncMsg.value = `Imported ${res.sessions} sessions, ${res.sets} sets${res.bodyweights ? `, ${res.bodyweights} bodyweights` : ''}.`
    $toast?.('Sync complete')
  } catch (e: any) {
    syncErr.value = e?.message ?? 'Sync failed.'
    $toast?.('Sync failed')
  } finally {
    syncing.value = false
  }
}
</script>

<template>
  <main class="max-w-xl mx-auto space-y-6 px-4 pt-6">
    <h1 class="text-2xl font-display font-extrabold">Settings</h1>

    <ClientOnly>
      <section class="space-y-6">
        <!-- Account -->
        <div class="card space-y-3">
          <h2 class="font-semibold">Account</h2>
          <div class="grid gap-2 md:grid-cols-[1fr_auto]">
            <input
              v-model="emailInput"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="you@example.com"
              class="input"
            />
            <button
              class="btn-primary w-full md:w-auto"
              :disabled="sending"
              @click="sendMagicLink"
            >
              {{ sending ? 'Sending…' : 'Send magic link' }}
            </button>
          </div>
          <div class="text-sm text-neutral-400">
            Status:
            <span class="font-semibold" :class="isAuthed ? 'text-green-400' : 'text-neutral-300'">
              {{ isAuthed ? 'Signed in' : 'Guest' }}
            </span>
            <span v-if="isAuthed && userEmail"> • {{ userEmail }}</span>
          </div>
          <p v-if="message" class="text-xs text-green-400">{{ message }}</p>
          <p v-if="errorMsg" class="text-xs text-firepink-600">{{ errorMsg }}</p>
        </div>

        <!-- Preferences -->
        <div class="card space-y-3">
          <h2 class="font-semibold">Preferences</h2>
          <label class="block text-sm">Weight units</label>
          <select v-model="units" class="select w-full">
            <option value="lb">lb</option>
            <option value="kg">kg</option>
          </select>
          <p class="text-xs text-neutral-400">(Defaults to lb if the store isn’t ready yet.)</p>
        </div>

        <!-- Data sync -->
        <div class="card space-y-3">
          <h2 class="font-semibold">Data</h2>
          <button class="btn-primary w-full md:w-auto" :disabled="syncing || !isAuthed" @click="syncNow">
            {{ syncing ? 'Syncing…' : 'Sync Now' }}
          </button>
          <p v-if="!isAuthed" class="text-xs text-neutral-400">Sign in to sync your cloud data into this device.</p>
          <p v-if="syncMsg" class="text-xs text-green-400">{{ syncMsg }}</p>
          <p v-if="syncErr" class="text-xs text-firepink-600">{{ syncErr }}</p>
        </div>

        <!-- Nav -->
        <NuxtLink class="underline underline-offset-4" to="/dashboard">← Back to Dashboard</NuxtLink>
      </section>
    </ClientOnly>
  </main>
</template>
