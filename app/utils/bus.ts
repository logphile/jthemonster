// Simple event bus for global quick log, etc.
export type Events = {
  'quicklog:open': { date?: string; sessionId?: string; exerciseId?: string } | void
}

const listeners = new Map<keyof Events, Set<(p: any) => void>>()

export const bus = {
  on<K extends keyof Events>(k: K, fn: (p: Events[K]) => void) {
    if (!listeners.has(k)) listeners.set(k, new Set())
    listeners.get(k)!.add(fn as any)
    return () => listeners.get(k)!.delete(fn as any)
  },
  emit<K extends keyof Events>(k: K, payload: Events[K]) {
    listeners.get(k)?.forEach((f) => f(payload))
  },
}

export const openQuickLog = (p?: Events['quicklog:open']) => bus.emit('quicklog:open', p ?? {})
