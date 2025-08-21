<script setup lang="ts">
// This is the restored default layout.
// The LogSetFab and GlobalQLSheet components are wrapped in ClientOnly
// to prevent hydration errors, as they may contain browser-only APIs.
onMounted(() => console.log('[layout] default mounted'))

// Quick Log sheet is global and self-managed via useQuickLog()
import LogQuickLogSheet from '~/components/log/QuickLogSheet.vue'
</script>

<template>
  <div class="min-h-screen min-h-dvh bg-bgDeep text-textHi font-sans antialiased">
    <Teleport to="body">
      <NuxtLink
        to="/settings"
        class="fixed z-[10000] right-3 sm:right-6 chip chip-active top-[max(0.75rem,env(safe-area-inset-top,0px))]"
      >
        Settings
      </NuxtLink>
    </Teleport>
    <slot />
    <LogSetFab />
    <LogQuickLogSheet />
  </div>
</template>
