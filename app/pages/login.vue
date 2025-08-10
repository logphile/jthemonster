<template>
  <div class="p-6 max-w-sm mx-auto">
    <h1 class="text-2xl font-bold mb-4">Login</h1>
    <form @submit.prevent="send">
      <input v-model="email" type="email" placeholder="Email" class="w-full p-3 rounded bg-gray-800 mb-3" required />
      <button class="w-full py-3 bg-indigo-600 rounded font-semibold">Send Magic Link</button>
    </form>
    <p v-if="sent" class="mt-3 text-sm text-gray-400">Check your email for the magic link.</p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
const email = ref('')
const sent = ref(false)
const { login } = useAuth()
async function send() {
  await login(email.value)
  sent.value = true
}
</script>
