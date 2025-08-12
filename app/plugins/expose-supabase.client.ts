export default defineNuxtPlugin(() => {
  // expose to the browser console for debugging only
  // @ts-ignore
  window.sb = useSupabaseClient()
})
