export type QuickLogPayload = {
  category: string
  exerciseId: string
  exerciseName?: string
  date?: string
  sessionId?: string
}

const isOpen = ref(false)
const payload = ref<QuickLogPayload | null>(null)

export function useQuickLog() {
  function open(p: QuickLogPayload) {
    payload.value = p
    isOpen.value = true
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('ql-no-scroll')
    }
  }
  function close() {
    isOpen.value = false
    payload.value = null
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('ql-no-scroll')
    }
  }
  return { isOpen, payload, open, close }
}
