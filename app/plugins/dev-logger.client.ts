export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (err, instance, info) => {
    // eslint-disable-next-line no-console
    console.error('[vue:error]', err, info, (instance as any)?.$?.type?.__file)
  })
})
