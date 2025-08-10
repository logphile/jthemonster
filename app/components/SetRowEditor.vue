<template>
  <div class="flex items-center gap-2 py-2">
    <input v-model.number="weight" inputmode="decimal" class="w-20 p-2 rounded bg-gray-800" placeholder="kg" />
    <input v-model.number="reps" inputmode="numeric" class="w-16 p-2 rounded bg-gray-800" placeholder="reps" />
    <input v-model.number="rpe" inputmode="decimal" class="w-16 p-2 rounded bg-gray-800" placeholder="RPE" />
    <label class="text-sm"><input type="checkbox" v-model="isWarmup" class="mr-1"/>Warm</label>
    <button class="px-3 py-2 bg-indigo-600 rounded" @click="$emit('save', { weight, reps, rpe, is_warmup: isWarmup })">Save</button>
  </div>
</template>
<script setup lang="ts">
const weight = ref<number | null>(null)
const reps = ref<number | null>(null)
const rpe = ref<number | null>(null)
const isWarmup = ref(false)
</script>
