<template>
  <div class="space-y-4">
    <TodayCard @start="showLog=true" />

    <MiniVolumeChart />

    <SetList :items="recent" @remove="remove" />

    <QuickLogSheet v-model="showLog" @save="addSet" />
  </div>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from 'nuxt/app'
useHead({ title: 'Dashboard • J The Monster' })
const showLog = ref(false)
const recent = ref([
  { exercise:'Bench Press', weight:185, reps:5 },
  { exercise:'Squat', weight:225, reps:5 },
  { exercise:'Deadlift', weight:275, reps:3 },
])

function remove(i:number){ recent.value.splice(i,1) }
function addSet(p:{weight:number; reps:number}){
  recent.value.unshift({ exercise:'Bench Press', ...p })
}
</script>
