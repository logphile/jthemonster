// app/nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

const url = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const key =
  process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  ''

if (!url || !key) {
  // This shows in CI logs but does not expose secrets
  // (We warn at build time instead of crashing at runtime.)
  // eslint-disable-next-line no-console
  console.warn('[nuxt-config] Missing Supabase envs at build time (URL or KEY).')
}

export default defineNuxtConfig({
  ssr: false,
  nitro: { preset: 'static' },

  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
  ],

  runtimeConfig: {
    public: {
      supabase: {
        url,
        key,
        redirect: false,
        useSsrCookies: false,
      },
    },
  },

  supabase: {
    url,
    key,
    redirect: false,
    useSsrCookies: false,
  },

  pinia: {
    autoImports: ['defineStore'], // optional convenience
  },

  vite: {
    build: {
      sourcemap: false,
    },
  },
})

