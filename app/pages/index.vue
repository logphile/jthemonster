<script setup lang="ts">
import { useProfileStore } from '~/stores/profile'
import { useSafeUser } from '~/composables/useSafeUser'
import { storeToRefs } from 'pinia'

const { isAuthed } = useSafeUser()
const profileStore = useProfileStore()
const { displayName } = storeToRefs(profileStore)
</script>

<template>
  <main class="p-4">
    <h1 class="text-2xl font-semibold">J The Monster</h1>

    <ClientOnly>
      <section class="mt-4">
        <p class="opacity-80">
          Welcome, {{ displayName }}
        </p>

        <div v-if="isAuthed" class="mt-4">
          <!-- Replace with your real dashboard component -->
          <NuxtLink to="/dashboard" class="underline">Go to Dashboard</NuxtLink>
        </div>

        <div v-else class="mt-4">
          <!-- Replace with your real auth panel -->
          <NuxtLink to="/settings" class="underline">Settings / Sign In</NuxtLink>
        </div>
      </section>
    </ClientOnly>
  </main>
</template>
