import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  if (!process.client) return

  // Vue runtime errors (fallback handler)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__VUE_ERROR_HANDLER__ = (err: any, instance: any, info: any) => {
    console.error('[Vue Error]', err, info, instance)
    try {
      alert('Something went wrong. Try Sync Now or reload. If it persists, tap Settings → Clear Local Cache.')
    } catch {}
  }

  // Unhandled Promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[Unhandled Rejection]', e.reason)
  })

  // Global error as a last resort
  window.addEventListener('error', (e) => {
    console.error('[Window Error]', e.error || e.message)
  })
})
