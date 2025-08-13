<script setup lang="ts">
import { useRepo } from '~/composables/useRepo'
const props = defineProps<{ split: string }>()
const model = defineModel<string[]>({ default: [] })
const { exercisesBySplit } = useRepo()
const list = ref<Array<{ id:string; name:string }>>([])

async function load() {
  if (!props.split) { list.value = []; return }
  const rows = await exercisesBySplit(props.split)
  list.value = rows.map(r => ({ id: r.id, name: r.name }))
}

watch(() => props.split, load, { immediate: true })

function toggle(id:string){
  const i = model.value.indexOf(id)
  if (i>=0) model.value.splice(i,1)
  else model.value.push(id)
}
</script>
<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="ex in list" :key="ex.id"
      class="px-3 py-1 rounded-full text-sm border border-white/10"
      :class="model.includes(ex.id) ? 'pill-active text-white' : 'bg-white/5'"
      @click="toggle(ex.id)"
    >{{ ex.name }}</button>
  </div>
</template>
