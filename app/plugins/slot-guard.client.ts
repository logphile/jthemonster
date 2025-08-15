import { getCurrentInstance } from 'vue'
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.mixin({
    setup() {
      const i = getCurrentInstance() as any; if (!i) return
      const slots = (i.slots ||= {})
      for (const k of Object.keys(slots)) {
        const fn = slots[k]
        if (typeof fn === 'function') slots[k] = (...a:any[]) => { try { return fn(...a) } catch { return [] } }
      }
      i.proxy!.$safeSlots = new Proxy(slots, { get(t,k){const v=(t as any)[k];return typeof v==='function'?v:()=>[]} })
    }
  })
})
