import { useSupabaseClientSingleton } from '~/composables/useSupabaseClient'
// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async () => {
  // Client-only safety; never throw or navigate to avoid blank screens
  if (!process.client) return
  try {
    const supa = (globalThis as any).useSupabaseClient?.() ?? useSupabaseClientSingleton?.()
    if (supa?.auth?.getUser) {
      await supa.auth.getUser()
    }
  } catch (e) {
    console.error('auth middleware', e)
  }
})
