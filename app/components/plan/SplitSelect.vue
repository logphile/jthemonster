<script setup lang="ts">
import { SPLITS } from '~/data/exercises'
// SPLITS is a Record<id, name>. Use the first key as default (no local refs for defineModel hoist).
const model = defineModel<string>({ default: Object.keys(SPLITS)[0] as string })
</script>
<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="(name, id) in SPLITS" :key="id"
      class="px-3 py-1 rounded-full text-sm border border-white/10"
      :class="model===id ? 'pill-active text-white' : 'bg-white/5'"
      @click="model = id as string"
    >{{ name }}</button>
  </div>
</template>
