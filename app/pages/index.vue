<template>
  <div class="space-y-4 pb-24">
    <TodayCard @start="showSheet=true" />
    <ClientOnly><MiniVolumeChart /></ClientOnly>
    <SetList :items="sets.items.value" @remove="sets.removeByIndex" />

    <Fab @click="showSheet=true">Log Set</Fab>
    <QuickLogSheet v-model="showSheet" @save="onSave" />
    <Toast ref="toast" />
  </div>
  
</template>

<script setup lang="ts">
const sets = useRecentSets()
const showSheet = ref(false)
const toast = ref<any>(null)

function onSave(p:{ exercise:string; weight:number; reps:number }) {
  sets.add(p.exercise, p.weight, p.reps)
  navigator.vibrate?.(10)
  toast.value?.show('Set logged')
}
</script>
