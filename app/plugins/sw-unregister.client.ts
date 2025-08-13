export default defineNuxtPlugin(() => {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
  try {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister().catch(() => {}))
    }).catch(() => {})
  } catch {}
})
