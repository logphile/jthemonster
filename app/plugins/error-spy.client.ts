export default defineNuxtPlugin((nuxtApp) => {
  const getName = (i: any) =>
    i?.type?.name || i?.type?.__name || i?.type?.__file || 'Anonymous'
  const getTree = (i: any) => {
    const chain: string[] = []
    let cur = i
    while (cur) { chain.push(getName(cur)); cur = cur.parent }
    return chain.reverse().join(' > ')
  }
  const printInst = (i?: any) => {
    if (!i) return
    const slots = i.slots ? Object.keys(i.slots) : i.slots
    const setupState = i.setupState ? Object.keys(i.setupState) : i.setupState
    console.log('[VueSpy] component:', getName(i))
    console.log('[VueSpy] tree:', getTree(i))
    console.log('[VueSpy] props:', i.props)
    console.log('[VueSpy] slots:', slots)
    console.log('[VueSpy] setupState keys:', setupState)
  }
  const log = (label: string, err: unknown, i?: any, info?: string) => {
    const route = nuxtApp.$router?.currentRoute?.value
    console.group(
      '%c[VueSpy]',
      'color:#fff;background:#111;padding:2px 6px;border-radius:4px;',
      label
    )
    console.log('info:', info)
    console.log('route:', route?.fullPath, 'query:', route?.query)
    printInst(i)
    console.error(err)
    console.trace('[VueSpy] call stack')
    console.groupEnd()
  }
  nuxtApp.hook('vue:error', (err, i, info) => log('nuxt hook vue:error', err, i, info))
  nuxtApp.hook('app:error', (err) => log('nuxt hook app:error', err as any))
  nuxtApp.vueApp.config.errorHandler = (err, i, info) => log('vue config.errorHandler', err, i, info)
})
