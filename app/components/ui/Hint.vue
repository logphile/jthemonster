<script setup lang="ts">
const props = defineProps<{
  text: string
  widthClass?: string  // e.g., 'w-72'
  placement?: 'top' | 'bottom'
}>()

const open = ref(false)

function toggle() { open.value = !open.value }
function close(e?: Event) { open.value = false }
onMounted(() => {
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') open.value = false })
})
</script>

<template>
  <span class="relative inline-flex items-center">
    <!-- The "?" button -->
    <button
      type="button"
      class="ml-1 shrink-0 h-5 w-5 rounded-full border border-zinc-700
             text-zinc-300/90 bg-zinc-900 hover:bg-zinc-800
             text-[11px] leading-[18px] text-center"
      aria-label="What is RPE?"
      :aria-expanded="open"
      @click="toggle"
    >?</button>

    <!-- Tooltip bubble -->
    <div
      v-if="open"
      class="absolute z-[1100]"
      :class="[
        props.placement === 'top' ? 'bottom-[130%] right-0' : 'top-[130%] right-0'
      ]"
      @click.outside="close"
    >
      <div :class="['rounded-xl border border-zinc-700 bg-zinc-900/95 shadow-2xl p-3 text-[12px] leading-snug', props.widthClass || 'w-72']">
        <slot>{{ props.text }}</slot>
      </div>
    </div>
  </span>
</template>
