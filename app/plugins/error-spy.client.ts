export default defineNuxtPlugin((nuxtApp) => {
  const name = (i:any)=> i?.type?.name || i?.type?.__name || i?.type?.__file || 'Anonymous'
  const tree = (i:any)=>{const a:string[]=[];let c=i;while(c){a.push(name(c));c=c.parent}return a.reverse().join(' > ')}
  const log = (label:string, err:unknown, i?:any, info?:string) => {
    const route = nuxtApp.$router?.currentRoute?.value
    console.group('%c[VueSpy]','color:#fff;background:#111;padding:2px 6px;border-radius:4px;',label)
    console.log('info:', info)
    console.log('route:', route?.fullPath, 'query:', route?.query)
    if (i) {
      console.log('component:', name(i))
      console.log('tree:', tree(i))
      console.log('props:', i.props)
      console.log('slots:', i.slots ? Object.keys(i.slots) : i.slots)
      console.log('setupState keys:', i.setupState ? Object.keys(i.setupState) : i.setupState)
    }
    console.error(err); console.trace('[VueSpy] stack'); console.groupEnd()
  }
  nuxtApp.hook('vue:error', (err,i,info)=>log('nuxt hook vue:error',err,i,info))
  nuxtApp.hook('app:error', (err)=>log('nuxt hook app:error', err as any))
  nuxtApp.vueApp.config.errorHandler = (err,i,info)=>log('vue config.errorHandler',err,i,info)
})
