<script setup lang="ts">
const props = withDefaults(defineProps<{ options: Array<{ id:string; name:string }>} >(), { options: () => [] })
const model = defineModel<string>({ default: 'all' })
</script>
<template>
  <div class="flex flex-wrap gap-2">
    <button
      class="px-3 py-1 rounded-full text-sm border border-white/10"
      :class="model==='all' ? 'pill-active text-white' : 'bg-white/5'"
      @click="model='all'"
    >All</button>
    <button
      v-for="o in props.options" :key="o.id"
      class="px-3 py-1 rounded-full text-sm border border-white/10"
      :class="model===o.id ? 'pill-active text-white' : 'bg-white/5'"
      @click="model=o.id"
    >{{ o.name }}</button>
  </div>
</template>
