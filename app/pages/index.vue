<template>
  <section class="relative min-h-screen bg-black overflow-hidden">
    <!-- Background -->
    <img
      :src="hero"
      alt="Young Berserk"
      class="absolute inset-0 w-full h-full object-cover animate-zoom"
      loading="eager"
      decoding="async"
    />

    <!-- Particles between image and overlay -->
    <EmberParticles />

    <!-- Gradient overlay for contrast -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>

    <!-- Content -->
    <div class="relative z-10 grid place-items-center min-h-screen text-center text-white px-6">
      <div>
        <h1 class="text-4xl md:text-6xl font-bold mb-4">LET’S GOOOO!</h1>
        <p class="max-w-xl mx-auto text-white/80">
          Push harder. Stay focused. Own your progress.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import EmberParticles from '@/components/EmberParticles.vue'

// Use the root-level public asset path emitted by build
// If you add WebP at app/public/home-hero.webp, change this to that path
const hero = '/home-hero.jpg'

useHead({
  link: [{ rel: 'preload', as: 'image', href: hero }]
})
</script>
