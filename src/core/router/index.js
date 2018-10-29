import Event from '../event'
let router = {
  event:null,
  started:false,
  active:'',
  type:'hashchange',
  _event(){
    if(!router.event){
      router.event = Event({})
    }
    return router.event
  },
  _hash(){
    return window.location.href.split('#')[1] || ''
  },
  go(path){
    window.location.hash = path
    router._emit(path)
    router.start()
  },
  change(callback){
    let event = router._event()
    event.on('H', callback)
    router.exec(callback);
  },
  _emit(path){
    if (path.type) path = router._hash()
    if (path != router.active) {
      let event = router._event()
      let parser = router._parser(path)
      event.trigger.apply(null, ['H'].concat(parser))
      router.active = path
    }
  },
  _parser(path){
    return path.split('/')
  },
  exec(callback){
    let parser = router._parser(router._hash())
    callback.apply(null, parser)
  },
  parse(callback){
    router._parser = callback
  },
  stop(){
    if (router.started) {
      if (window.removeEventListener){
        window.removeEventListener(router.type, router._emit, false)
      } else{
        window.detachEvent('on' + router.type, router._emit)
      } 
      let event = router._event() 
      event.off('*')
      router.started = false
    }
  },
  start(){
    if (!router.started) {
      if (window.addEventListener){
        window.addEventListener(router.type, router._emit, false)
       } 
      else window.attachEvent('on' + router.type, router._emit)
      router.started = true
    }
  }
}
export default router