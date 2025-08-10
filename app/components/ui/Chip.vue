<template>
  <button
    v-bind="$attrs"
    class="rounded-full bg-card px-3 py-1 text-sm text-subtext border border-border/60 hover:text-text">
    <slot/>
  </button>
</template>
