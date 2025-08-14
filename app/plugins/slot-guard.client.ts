import { getCurrentInstance } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.mixin({
    setup() {
      const i = getCurrentInstance() as any
      if (!i) return
      const slots = (i.slots ||= {})
      // wrap each slot function with a guard
      for (const k of Object.keys(slots)) {
        const fn = slots[k]
        if (typeof fn === 'function') {
          slots[k] = (...args: any[]) => {
            try { return fn(...args) } catch { return [] }
          }
        }
      }
      // provide a safe accessor so code like $slots.subtitle?.() never throws
      i.proxy!.$safeSlots = new Proxy(slots, {
        get(target, key) {
          const v = (target as any)[key]
          return typeof v === 'function' ? v : () => []
        }
      })
    }
  })
})
