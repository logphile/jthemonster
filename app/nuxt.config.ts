// app/nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,                  // SPA
  nitro: { preset: 'static' }, // generate .output/public

  modules: ['@nuxtjs/supabase'],

  // Expose to your own app code
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
    }
  },

  // Feed values to the @nuxtjs/supabase module
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY,
    redirect: false,
    useSsrCookies: false
  },

  app: { baseURL: '/' }
})

