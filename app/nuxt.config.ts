// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,                         // SPA
  nitro: { preset: 'static' },        // generate .output/public
  modules: [
    // Temporarily disable PWA to avoid stale shells; re-enable later
    // '@vite-pwa/nuxt',
    '@nuxtjs/supabase'
  ],
  app: { baseURL: '/' }
})

