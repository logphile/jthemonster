const KEY = 'jt_units_v1' // 'lb' | 'kg'
export function useUnits() {
  const unit = useState<'lb'|'kg'>('units', () => 'kg')
  if (process.client && !localStorage.getItem(KEY)) localStorage.setItem(KEY, unit.value)
  if (process.client) {
    const saved = localStorage.getItem(KEY) as 'lb'|'kg'|null
    if (saved) unit.value = saved
    watch(unit, v => localStorage.setItem(KEY, v))
  }
  const toDisplay = (kg: number) => unit.value === 'kg' ? kg : Math.round(kg * 2.20462)
  const unitLabel = computed(() => unit.value)
  return { unit, toDisplay, unitLabel }
}
