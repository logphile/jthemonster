<template>
  <Card>
    <div class="p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="eyebrow">Today</p>
          <h2 class="title-large">{{ prettyDate }}</h2>
        </div>
        <span class="chip chip-active">Week {{ weekNum }}</span>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <div class="rounded-xl bg-plum800 border border-white/10 p-3">
          <p class="eyebrow">Last Set</p>
          <p class="mt-1 text-base">{{ lastSetLabel }}</p>
        </div>
        <div class="rounded-xl bg-plum800 border border-white/10 p-3">
          <p class="eyebrow">Volume (7d, lb)</p>
          <p class="mt-1 text-base">{{ weekVolume }} lb</p>
        </div>
      </div>

      <div class="mt-4">
        <PrimaryButton @click="$emit('start')">
          <span class="title-small">{{ hasSession ? 'Resume Session' : 'Start Session' }}</span>
        </PrimaryButton>
        <p v-if="!hasSession" class="mt-2 text-xs text-white/70">Preparing session…</p>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
const props = defineProps<{ sessionId: string | null }>()
const { lastLabel, volume7d } = useRecentSets()
const prettyDate = new Date().toLocaleDateString(undefined, { weekday: 'long', month:'short', day:'numeric' })
const weekNum = Math.ceil((new Date().getDate()) / 7)
const hasSession = computed(() => !!props.sessionId)
const lastSetLabel = computed(() => lastLabel())
// volume7d() already returns lb, display as-is
const weekVolume = computed(() => volume7d())
</script>
