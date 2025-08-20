<script setup lang="ts">
const props = defineProps<{
  open: boolean
  points: Array<{ x: string; y: number; sessionId: string }>
  type?: 'line' | 'bar'
  label?: string
}>()
const emit = defineEmits<{ (e:'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[70]">
        <div class="absolute inset-0 bg-black/70" @click="emit('close')" />
        <div class="absolute inset-x-2 sm:inset-x-6 md:inset-x-12 top-8 bottom-8 rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col">
          <header class="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 class="text-sm font-semibold opacity-90">Progress</h3>
            <button class="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm" @click="emit('close')">Close</button>
          </header>
          <div class="flex-1 p-2 sm:p-4">
            <div class="w-full h-[65vh] sm:h-[70vh]">
              <ClientOnly>
                <ProgressChart :points="props.points" :type="props.type || 'line'" :label="props.label || 'Top Set (lb)'" />
                <template #fallback>
                  <div class="w-full h-full grid place-items-center text-sm opacity-70">Loading chart…</div>
                </template>
              </ClientOnly>
            </div>
            <div v-if="!props.points?.length" class="mt-4 text-xs opacity-70">No data for the selected exercise and date range.</div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
