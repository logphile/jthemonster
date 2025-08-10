<template>
  <div ref="root" class="relative h-dvh w-dvw overflow-hidden bg-bg">
    <!-- animated gradient backdrop -->
    <div
      class="absolute inset-0 animate-bg-pan"
      :style="bgStyle"
      aria-hidden="true"
    />
    <!-- darken for contrast -->
    <div class="absolute inset-0 bg-black/35" aria-hidden="true" />

    <!-- center content -->
    <div class="relative z-10 h-full grid place-items-center px-6">
      <div class="w-full max-w-sm text-center">
        <h1 class="font-display text-3xl mb-6">
          <span class="text-primary">J</span> The Monster
        </h1>
        <PrimaryButton class="text-lg py-4 rounded-2xl" @click="go">
          LET'S GOOOO!
        </PrimaryButton>
        <p class="mt-3 text-subtext text-xs">Tap to start your session</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSupabaseClientSingleton } from '@/composables/useSupabaseClient'

const supabase = useSupabaseClientSingleton()
const root = ref<HTMLElement | null>(null)

// Nice, subtle multi-stop gradient using our palette
const bgStyle = computed(() => ({
  backgroundImage:
    `radial-gradient(60% 45% at 0% 0%, rgba(244,63,94,.25), transparent 60%),
     radial-gradient(50% 40% at 100% 0%, rgba(253,186,116,.22), transparent 60%),
     radial-gradient(55% 50% at 50% 100%, rgba(34,197,94,.20), transparent 60%)`,
}))

async function go() {
  // Mark this session as "welcome seen"
  const { data } = await supabase.auth.getSession()
  const sig = (data.session?.access_token || '').slice(-24) || 'anon'
  const key = `jt_welcome_${sig}`
  if (process.client) localStorage.setItem(key, '1')

  // Fade out then navigate
  root.value?.classList.add('animate-exit')
  setTimeout(() => navigateTo('/'), 360)
}

// If user somehow returns here after seeing it, bounce to /
onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  const sig = (data.session?.access_token || '').slice(-24) || 'anon'
  if (process.client && localStorage.getItem(`jt_welcome_${sig}`)) {
    navigateTo('/')
  }
})
</script>
