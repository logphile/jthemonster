<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Exercises</h1>
    <div class="flex gap-2 mb-3">
      <input v-model="name" placeholder="New exercise" class="p-3 rounded bg-gray-800" />
      <button class="px-4 py-2 bg-indigo-600 rounded" @click="addNew">Add</button>
    </div>
    <ul>
      <li v-for="e in exercises.list" :key="e.id" class="py-2 flex justify-between items-center">
        <span>{{ e.name }}</span>
        <button class="text-sm text-red-400" @click="exercises.remove(e.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
const exercises = useExercises()
const name = ref('')

onMounted(() => exercises.load())
async function addNew(){ if(name.value) { await exercises.add(name.value); name.value=''} }
useHead({ title: 'Exercises • J The Monster' })
</script>
