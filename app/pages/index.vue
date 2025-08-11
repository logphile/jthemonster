<template>
  <section class="relative min-h-screen flex items-center justify-center bg-black">
    <div class="absolute inset-0">
      <img
        :src="hero"
        alt="Young Berserk"
        loading="eager"
        class="w-full h-full object-cover animate-zoom"
      />
      <!-- Particles above image, below overlay -->
      <EmberParticles />
      <!-- Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 text-center text-white">
      <h1 class="text-4xl md:text-6xl font-bold mb-4">LET’S GOOOO!</h1>
      <p class="max-w-lg mx-auto text-lg text-white/80">
        Push harder. Stay focused. Own your progress.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
// Homepage hero. Place /public/img/home-hero.jpg (~1920px, <500KB) for best results.
const hero = '/home-hero.jpg'
</script>
