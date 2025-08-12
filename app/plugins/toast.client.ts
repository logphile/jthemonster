import { defineAsyncComponent, createApp } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  let api: any
  nuxtApp.hook('app:mounted', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const app = createApp(defineAsyncComponent(() => import('~/components/ui/Toast.vue')))
    api = app.mount(el)
  })
  return {
    provide: {
      toast: (t: string) => api?.open?.(t),
    },
  }
})
