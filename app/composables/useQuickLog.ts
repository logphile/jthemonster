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
