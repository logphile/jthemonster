export default defineNuxtPlugin((nuxtApp) => {
  const r = nuxtApp.$router
  r?.beforeEach((to, from) => {
    console.log('[route->]', to.fullPath, 'query:', to.query)
    return true
  })
  r?.afterEach((to) => {
    requestAnimationFrame(() => {
      console.log('[route mount painted]', to.fullPath)
    })
  })
})
