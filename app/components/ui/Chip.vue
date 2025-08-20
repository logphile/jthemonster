<script setup lang="ts">
const props = defineProps<{ active?: boolean }>()
</script>

<template>
  <button
    v-bind="$attrs"
    :class="['chip', props.active ? 'chip-active' : '']">
    <slot />
  </button>
</template>
