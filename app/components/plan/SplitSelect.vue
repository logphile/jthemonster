<script setup lang="ts">
import { SPLITS } from '~/data/exercises'
const model = defineModel<string>({ default: SPLITS[0].id })
</script>
<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="s in SPLITS" :key="s.id"
      class="px-3 py-1 rounded-full text-sm border border-white/10"
      :class="model===s.id ? 'bg-red-600 text-white' : 'bg-white/5'"
      @click="model = s.id"
    >{{ s.name }}</button>
  </div>
</template>
