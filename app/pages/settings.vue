<script setup lang="ts">
/**
 * Crash-proof Settings page:
 * - No direct route.query access
 * - No slot calls
 * - All state has safe defaults
 * - Works when user is null on first paint
 */

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
</script>

<template>
  <main class="p-4 max-w-screen-sm">
    <h1 class="text-2xl font-semibold">Settings</h1>

    <ClientOnly>
      <section class="mt-5 space-y-6">
        <!-- Auth row -->
        <div class="border rounded p-3">
          <h2 class="font-medium mb-2">Account</h2>

          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              v-model="emailInput"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="you@example.com"
              class="border rounded px-2 py-1 flex-1"
            />
            <button
              class="border rounded px-3 py-1"
              :disabled="sending"
              @click="sendMagicLink"
            >
              {{ sending ? 'Sending…' : 'Send magic link' }}
            </button>
          </div>

          <p class="text-xs mt-2 opacity-70">
            Status: <strong>{{ isAuthed ? 'Signed in' : 'Guest' }}</strong>
            <span v-if="isAuthed && userEmail"> • {{ userEmail }}</span>
          </p>

          <p v-if="message" class="text-xs mt-2 text-green-700">{{ message }}</p>
          <p v-if="errorMsg" class="text-xs mt-2 text-red-700">{{ errorMsg }}</p>
        </div>

        <!-- Units -->
        <div class="border rounded p-3">
          <h2 class="font-medium mb-2">Preferences</h2>
          <div class="flex items-center gap-3">
            <label class="text-sm">Weight units</label>
            <select v-model="units" class="border rounded px-2 py-1">
              <option value="lb">lb</option>
              <option value="kg">kg</option>
            </select>
          </div>
          <p class="text-xs mt-2 opacity-70">
            (Defaults to <code>lb</code> if the store isn’t ready yet.)
          </p>
        </div>

        <!-- Nav -->
        <div>
          <NuxtLink to="/" class="underline">← Back to Dashboard</NuxtLink>
        </div>
      </section>
    </ClientOnly>
  </main>
</template>
