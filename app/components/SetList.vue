<template>
  <Card>
    <div class="p-4">
      <header class="mb-2 flex items-center justify-between">
        <h3 class="font-display text-lg">Recent Sets</h3>
        <span class="text-xs text-subtext">{{ items.length }} total</span>
      </header>

      <ul class="divide-y divide-border/60">
        <li v-for="(it,i) in items" :key="i" class="py-3 flex items-center justify-between">
          <div>
            <p class="text-sm">{{ it.exercise }}</p>
            <p class="text-xs text-subtext">{{ it.weight }} × {{ it.reps }}</p>
          </div>
          <button class="text-danger hover:opacity-80" @click="$emit('remove', i)">Delete</button>
        </li>
      </ul>
    </div>
  </Card>
</template>

<script setup lang="ts">
defineProps<{ items: Array<{exercise:string; weight:number; reps:number}> }>()
defineEmits<{ (e:'remove', index:number): void }>()
</script>
