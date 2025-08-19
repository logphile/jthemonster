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
// Sentinel toggled by the sheet component when it mounts/unmounts
const useMounted = () => useState<boolean>('quicklog-mounted', () => false)

export function useQuickLog() {
  const isOpen = useIsOpen()
  const payload = usePayload()
  const mounted = useMounted()

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
    // If the sheet fails to mount (render error, etc.), auto-unlock scroll and report
    if (process.client) {
      setTimeout(() => {
        if (isOpen.value && !mounted.value) {
          // eslint-disable-next-line no-console
          console.warn('[QuickLog] Sheet did not mount within 500ms. Unlocking to avoid stuck scroll.')
          isOpen.value = false
          // payload remains set for inspection; caller may retry
        }
      }, 500)
    }
  }

  function close() {
    isOpen.value = false
    payload.value = null
  }

  return { isOpen, payload, open, close, mounted }
}
