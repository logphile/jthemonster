<script setup lang="ts">
import { useRepo } from '~/composables/useRepo'
const open = ref(false)
const val = ref('')
const emit = defineEmits<{ (e:'saved', payload:{ date:string; weightLb:number }):void }>()
const { logBodyweight } = useRepo()
// Broadcast open state so global FAB can hide while weight modal is open
watch(open, (v) => {
  try { window.dispatchEvent?.(new CustomEvent('jt:weight-open', { detail: v })) } catch {}
})
async function save(){
  const n = Number(val.value)
  if (!n) { open.value=false; return }
  const date = new Date().toISOString().slice(0,10)
  const bw = await logBodyweight(n, date)
  emit('saved', bw)
  open.value = false
  val.value = ''
}
</script>
<template>
  <div>
    <button class="px-3 py-2 rounded-xl text-white bg-gradient-to-br from-firepink-600 to-firepink-700 text-sm font-semibold" @click="open=true">Log Weight</button>
    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-[1100] grid place-items-end sm:place-items-center" role="dialog" aria-modal="true">
        <div class="absolute inset-0 bg-black/60" @click="open=false"></div>
        <div class="relative z-10 w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-card border border-border/60 p-4 backdrop-blur">
          <div class="mx-auto h-1 w-10 rounded-full bg-white/20 mb-3" />
          <h3 class="font-display text-lg mb-3">Log Bodyweight</h3>
          <input v-model="val" inputmode="decimal" placeholder="e.g. 172" class="w-full rounded-xl bg-bg border border-border/60 px-3 py-2" />
          <div class="mt-3 flex justify-end gap-2">
            <button class="px-3 py-2 rounded-xl bg-white/10" @click="open=false">Cancel</button>
            <button class="px-3 py-2 rounded-xl text-white bg-gradient-to-br from-firepink-600 to-firepink-700" @click="save">Save</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
