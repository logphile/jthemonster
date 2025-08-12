export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (err, inst, info) => {
    // eslint-disable-next-line no-console
    console.error('[vue:error]', err, info, inst?.$?.type?.__file, (err as any)?.stack)
  })
  nuxtApp.hook('app:error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[app:error]', err)
  })
})
