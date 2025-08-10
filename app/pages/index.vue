<template>
  <div class="space-y-4">
    <TodayCard @start="showLog=true" />
    <SetList :items="recent" @remove="i=>recent.splice(i,1)" />
    <QuickLogSheet v-model="showLog" @save="p=>recent.unshift({ exercise:'Bench Press', ...p })" />
  </div>
  
</template>

<script setup lang="ts">
const showLog = ref(false)
const recent = ref([
  { exercise:'Bench Press', weight:185, reps:5 },
  { exercise:'Squat', weight:225, reps:5 },
  { exercise:'Deadlift', weight:275, reps:3 },
])
</script>
