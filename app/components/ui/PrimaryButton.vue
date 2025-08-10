<template>
  <button
    v-bind="$attrs"
    class="w-full select-none rounded-2xl bg-primary px-4 py-3 font-semibold text-bg shadow-soft transition active:scale-[.99] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40">
    <slot />
  </button>
</template>
