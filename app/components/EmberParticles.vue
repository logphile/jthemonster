<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden">
    <div
      v-for="n in 40"
      :key="n"
      class="absolute w-1 h-1 bg-orange-400 rounded-full opacity-50 animate-float"
      :style="{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${10 + Math.random() * 10}s`,
      }"
    ></div>
  </div>
</template>

<style scoped>
@keyframes float {
  0% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { opacity: 1; }
  100% { transform: translateY(-200px) scale(0.5); opacity: 0; }
}
.animate-float {
  animation: float linear infinite;
}
</style>
