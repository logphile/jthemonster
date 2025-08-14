export const useSafeQuery = () => {
  const route = useRoute()
  return computed<Record<string, string>>(() => {
    const q = route.query
    const out: Record<string, string> = {}
    for (const k of Object.keys(q)) {
      const v = q[k]
      out[k] = Array.isArray(v) ? String(v[0] ?? '') : String(v ?? '')
    }
    return out
  })
}
