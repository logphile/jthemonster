<template>
  <button
    v-bind="$attrs"
    class="btn-primary w-full select-none disabled:opacity-50 disabled:cursor-not-allowed">
    <slot />
  </button>
</template>
