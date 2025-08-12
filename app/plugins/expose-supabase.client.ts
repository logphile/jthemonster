// @ts-ignore -- Nuxt auto-imports typing may lag behind local composables
import { useSupabaseClientSingleton } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  // Defer until the app is mounted so the Supabase module is ready
  if (import.meta.dev) {
    nuxtApp.hook('app:mounted', () => {
      const sb = useSupabaseClientSingleton()
      // @ts-ignore attach for debugging only
      window.sb = sb
      console.log('[expose-supabase] window.sb ready')
    })
  }
})
