export default defineNuxtPlugin((nuxtApp) => {
  const getName = (i: any) =>
    i?.type?.name || i?.type?.__name || i?.type?.__file || 'Anonymous'

  const getTree = (i: any) => {
    const chain: string[] = []
    let cur = i
    while (cur) { chain.push(getName(cur)); cur = cur.parent }
    return chain.reverse().join(' > ')
  }

  const log = (label: string, err: unknown, i?: any, info?: string) => {
    try {
      // route is safe to read on client
      const route = nuxtApp.$router?.currentRoute?.value
      console.group('%c[VueSpy]', 'color:#fff;background:#111;padding:2px 6px;border-radius:4px;', label)
      console.log('info:', info)
      console.log('route:', route?.fullPath, route?.query)
      if (i) {
        console.log('component:', getName(i))
        console.log('tree:', getTree(i))
        console.log('props:', i.props)
        console.log('slots:', i.slots ? Object.keys(i.slots) : i.slots)
        console.log('setupState:', i.setupState ? Object.keys(i.setupState) : i.setupState)
      }
      console.error(err)
      console.groupEnd()
    } catch (e) {
      console.error('[VueSpy log failed]', e)
    }
  }

  // Nuxt hooks + Vue error handler
  nuxtApp.hook('vue:error', (err, i, info) => log('nuxt hook vue:error', err, i, info))
  nuxtApp.hook('app:error', (err) => log('nuxt hook app:error', err as any))
  nuxtApp.vueApp.config.errorHandler = (err, i, info) => log('vue config.errorHandler', err, i, info)
})
