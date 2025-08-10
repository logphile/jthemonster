<template>
  <div class="space-y-4">
    <Card>
      <div class="p-4">
        <h2 class="font-display text-xl mb-2">Settings</h2>
        <div class="flex items-center gap-3">
          <span class="text-subtext text-sm">Units</span>
          <button @click="toggle" class="rounded-full border border-border/60 px-3 py-1">
            {{ units.unit.value.toUpperCase() }}
          </button>
        </div>
      </div>
    </Card>
  </div>
  
</template>

<script setup lang="ts">
const units = useUnits()
function toggle(){ units.unit.value = units.unit.value === 'kg' ? 'lb' : 'kg' }
</script>
