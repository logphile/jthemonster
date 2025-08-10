<template>
  <Card>
    <div class="p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-subtext text-sm">Today</p>
          <h2 class="font-display text-xl">{{ prettyDate }}</h2>
        </div>
        <span class="rounded-xl bg-primary/15 text-primary px-3 py-1 text-sm">Week {{ weekNum }}</span>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <div class="rounded-xl border border-border/60 p-3">
          <p class="text-subtext text-xs">Last Set</p>
          <p class="mt-1 text-base">{{ lastSetLabel }}</p>
        </div>
        <div class="rounded-xl border border-border/60 p-3">
          <p class="text-subtext text-xs">Volume (7d)</p>
          <p class="mt-1 text-base">{{ weekVolume }} kg</p>
        </div>
      </div>

      <div class="mt-4">
        <PrimaryButton @click="$emit('start')">
          {{ hasSession ? 'Resume Session' : 'Start Session' }}
        </PrimaryButton>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
defineEmits<{ (e:'start'): void }>()
const { lastLabel, volume7d } = useRecentSets()
const prettyDate = new Date().toLocaleDateString(undefined, { weekday: 'long', month:'short', day:'numeric' })
const weekNum = Math.ceil((new Date().getDate()) / 7)
const hasSession = false
const lastSetLabel = computed(() => lastLabel())
const weekVolume = computed(() => volume7d())
</script>
