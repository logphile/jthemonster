export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.env.VITE_DEBUG_TOOLS !== '1') {
    return
  }
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
