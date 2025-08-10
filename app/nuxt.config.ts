// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Static SPA
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  css: ['~/assets/css/tailwind.css'],
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt'
  ],
  // No Nitro Azure preset for static hosting
  runtimeConfig: {
    public: {
      NUXT_PUBLIC_SUPABASE_URL: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      NUXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'J The Monster',
      short_name: 'JMonster',
      description: 'Mobile-first lift tracker for one athlete + one coach',
      theme_color: '#0b0f14',
      background_color: '#0b0f14',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}']
    }
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    viewer: false
  }
})
