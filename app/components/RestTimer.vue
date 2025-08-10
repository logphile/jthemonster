<template>
  <div class="flex items-center gap-2">
    <button class="px-3 py-2 bg-gray-800 rounded" @click="start(120)">2:00</button>
    <button class="px-3 py-2 bg-gray-800 rounded" @click="start(180)">3:00</button>
    <span class="tabular-nums">{{ mm }}:{{ ss }}</span>
  </div>
</template>
<script setup lang="ts">
const remaining = ref(0)
let timer: any
function start(sec: number){ clearInterval(timer); remaining.value = sec; timer=setInterval(()=>{ if(remaining.value>0) remaining.value--; }, 1000) }
const mm = computed(()=> String(Math.floor(remaining.value/60)).padStart(1,'0'))
const ss = computed(()=> String(remaining.value%60).padStart(2,'0'))
</script>
