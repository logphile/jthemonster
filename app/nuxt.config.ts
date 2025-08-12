// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Static SPA
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  sourcemap: { client: true },
  css: ['~/assets/css/tailwind.css'],
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt'
  ],
  // No Nitro Azure preset for static hosting
  runtimeConfig: {
    public: {
      // Site URL used for magic-link redirects (prod/dev)
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      // Supabase
      // New canonical keys used by composables/docs
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      // Back-compat for existing references
      NUXT_PUBLIC_SUPABASE_URL: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      NUXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      // Dev seeding guard
      enableSeed: process.env.NUXT_PUBLIC_ENABLE_SEED === '1',
      seedEmail: process.env.NUXT_PUBLIC_SEED_EMAIL || ''
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'J The Monster',
      short_name: 'JMonster',
      description: 'Mobile-first lift tracker for one athlete + one coach',
      theme_color: '#0A0A0A',
      background_color: '#0A0A0A',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      // Avoid precaching oversized assets and fix build failure
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      globIgnores: ['**/jthemonster.png']
    }
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    viewer: false
  }
  ,
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Sora:wght@600;700&display=swap' }
      ],
      bodyAttrs: { class: 'bg-bg text-text' }
    }
  }
})

