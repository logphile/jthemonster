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
    // '@vite-pwa/nuxt' // Temporarily disabled to avoid stale shells during debug
    '@nuxtjs/supabase'
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
  // PWA temporarily disabled while stabilizing auth/routing
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

