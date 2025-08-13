import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  if (!process.client) return

  // Global console-only guards to avoid user-facing alerts/teardowns
  window.addEventListener('error', (e) => console.error('[Window Error]', (e as any).error || e))
  window.addEventListener('unhandledrejection', (e: any) => console.error('[Unhandled]', e?.reason || e))
})
