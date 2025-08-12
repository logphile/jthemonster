<template>
  <div v-if="open" class="fixed inset-0 z-40 grid place-items-end sm:place-items-center">
    <div class="absolute inset-0 bg-black/60" @click="close"></div>
    <div class="relative z-10 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border/60 p-4">
      <header class="mb-2 flex items-center justify-between">
        <h3 class="font-display text-lg">Quick Log</h3>
        <button @click="close" class="text-subtext hover:text-text">Close</button>
      </header>

      <div class="mb-3">
        <label class="text-xs text-subtext">Exercise</label>
        <input ref="exInput" v-model="exercise" autofocus class="mt-1 w-full rounded-xl bg-bg border border-border/60 px-3 py-2" placeholder="e.g., Bench Press" />
        <div class="mt-2 flex flex-wrap gap-2">
          <Chip @click="exercise='Bench Press'">Bench</Chip>
          <Chip @click="exercise='Squat'">Squat</Chip>
          <Chip @click="exercise='Deadlift'">Deadlift</Chip>
          <Chip @click="exercise='Overhead Press'">OHP</Chip>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-subtext">Weight ({{ units.unitLabel }})</label>
          <input v-model.number="weight" inputmode="decimal"
                 class="mt-1 w-full rounded-xl bg-bg border border-border/60 px-3 py-2" />
        </div>
        <div>
          <label class="text-xs text-subtext">Reps</label>
          <input v-model.number="reps" inputmode="numeric"
                 class="mt-1 w-full rounded-xl bg-bg border border-border/60 px-3 py-2" />
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-2">
        <Chip @click="weight+=5">+5 lb</Chip>
        <Chip @click="reps+=1">+1 rep</Chip>
        <Chip @click="repeatLast()">Repeat last</Chip>
      </div>

      <div class="mt-4">
        <PrimaryButton @click="save">Add set</PrimaryButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Chip from '~/components/ui/Chip.vue'
import PrimaryButton from '~/components/ui/PrimaryButton.vue'
const units = useUnits()

const props = defineProps<{ modelValue: boolean; sessionId?: string }>()
const emit = defineEmits<{ (e:'update:modelValue', v:boolean):void, (e:'save', payload:{exercise:string; weight:number; reps:number}):void }>()

const open = computed(()=>props.modelValue)
const exercise = ref('Bench Press')
const weight = ref(135)
const reps = ref(5)
const exInput = ref<HTMLInputElement | null>(null)
watch(open, v => { if (v) nextTick(() => exInput.value?.focus()) })

function save(){
  // If a session is required upstream, guard here just in case
  if (!props.sessionId) { emit('update:modelValue', false); return }
  emit('save', { exercise: exercise.value, weight: weight.value, reps: reps.value })
  emit('update:modelValue', false)
}
function close(){ emit('update:modelValue', false) }
function repeatLast(){ /* wire later */ }
</script>
