<template>
  <div class="p-4 space-y-4">
    <ExercisePicker v-model="selectedId" />
    <ExerciseProgress v-if="selectedId" :exerciseId="selectedId" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from 'nuxt/app'
const selectedId = ref<string | null>(null)
useHead({ title: 'Progress • J The Monster' })
</script>
