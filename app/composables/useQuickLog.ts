import { watch } from 'vue'

export type QuickLogPayload = {
  category: string
  exerciseId: string
  exerciseName?: string
  date?: string
  sessionId?: string
}

// Use Nuxt's useState for a true, app-scoped singleton state.
const useIsOpen = () => useState<boolean>('quicklog-is-open', () => false)
const usePayload = () => useState<QuickLogPayload | null>('quicklog-payload', () => null)

export function useQuickLog() {
  const isOpen = useIsOpen()
  const payload = usePayload()

  // Keep body scroll lock in sync with the open state, regardless of who toggles it
  if (process.client) {
    watch(isOpen, (v) => {
      try {
        document.documentElement.classList.toggle('ql-no-scroll', !!v)
      } catch {}
    }, { immediate: true })
  }

  function open(p: QuickLogPayload) {
    payload.value = p
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    payload.value = null
  }

  return { isOpen, payload, open, close }
}
