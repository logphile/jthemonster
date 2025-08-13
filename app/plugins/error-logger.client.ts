export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('error', (e) => {
    // Prefer the underlying Error object when available
    console.error('[window.error]', (e as any).error || e.message || e)
  })
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[unhandledrejection]', (e as any).reason)
  })
})
