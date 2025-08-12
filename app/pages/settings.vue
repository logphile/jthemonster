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

    <!-- Data section: manual sync -->
    <Card>
      <div class="p-4 space-y-2">
        <h3 class="text-lg font-semibold">Data</h3>
        <p class="text-sm text-subtext">Pull recent cloud data into this device.</p>
        <div class="flex items-center gap-3">
          <PrimaryButton @click="doSync" :disabled="syncing">
            {{ syncing ? 'Syncing…' : 'Sync Now' }}
          </PrimaryButton>
          <span v-if="lastResult" class="text-xs text-subtext">{{ lastResult }}</span>
          <span v-if="errorMsg" class="text-xs text-danger">{{ errorMsg }}</span>
        </div>
      </div>
    </Card>
  </div>
  
</template>

<script setup lang="ts">
import PrimaryButton from '~/components/ui/PrimaryButton.vue'
import { importFromSupabase } from '~/composables/useSync'
const units = useUnits()
function toggle(){ units.unit.value = units.unit.value === 'kg' ? 'lb' : 'kg' }

const syncing = ref(false)
const lastResult = ref('')
const errorMsg = ref('')

async function doSync(){
  syncing.value = true
  lastResult.value = ''
  errorMsg.value = ''
  try {
    const res = await importFromSupabase(60)
    if ((res as any).imported) {
      lastResult.value = `Imported ${res.sessions} sessions, ${res.sets} sets, ${res.bodyweights} bodyweights`
    } else {
      lastResult.value = `Skipped (${(res as any).reason || 'unknown'})`
    }
  } catch (e: any) {
    errorMsg.value = e?.message || String(e)
  } finally {
    syncing.value = false
  }
}
</script>
