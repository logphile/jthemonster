<template>
  <div>
    <label class="block mb-1 text-sm text-gray-400">Exercise</label>
    <select v-model="model" class="w-full p-3 rounded bg-gray-800">
      <option :value="null">Select...</option>
      <option v-for="e in exercises.list" :key="e.id" :value="e.id">{{ e.name }}</option>
    </select>
  </div>
</template>
<script setup lang="ts">
const exercises = useExercises()
const model = defineModel<string|null>({ default: null })

onMounted(()=> exercises.load())
</script>
