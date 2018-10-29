import {type, nextTick, filter} from '../util'
import observer from '../observer'
import proxy from './proxy'
import computed from './computed'


export default function init(vm, options={}){
  let base = vm.$
  options.keeps={'$':true}
  base.options = options
  base.parent = options.parent
  base.vm = vm;
  initEvent(base)
  base.emit('beforeCreate')

  initProps(base)
  initData(base)
  initComputed(base)
  initMethods(base)
  initSync(base)
  initWatch(base)

  base.emit('created')
  options.el && base.mount(options.el)
}

function initProps(base){
  // 过滤内置关键字
  let data = base.options.props || {};
  base.props = filter(base,data,'props','keeps')
  proxy(base.vm, base.props);
  observer(base.props)
}

function initData(base){
  let data = base.options.data || {};
  data = type(data).isFunction ? data.call(vm) : data
  // 过滤props已定义
  base.data = filter(base,data,'data',['keeps','props'])
  proxy(base.vm, base.data)
  observer(base.data)
}

function initComputed(base){
  let computeds = base.options.computed || {};
  // 过滤props,data已定义
  computeds = filter(base,computeds,'computed',['keeps','props','data'])
  computed(base.vm,computeds)
}

// 异步模式
function initSync(base){
  if(!base.options.sync){
    base.nextTick = function nextTick(fn){
      return nextTick(fn, base.vm)
    }
  }
}

function initMethods(base){
  let methods = base.options.methods || {}
  // 过滤props,data,computed已定义
  methods = filter(base,methods,'methods',['keeps','props','data','computed'])
  for(let key in methods){
    base.vm[key] = methods[key]
  }
}

function initEvent(base){

  // 绑定事件
  Fui.event(base);

  // 注册语法糖事件
  ['beforeCreate','created','beforeMount','mounted','beforeUpdate','updated'].forEach(ev=>{
    let fn = base.options[ev];
    if(fn && type(fn).isFunction){
      base.on(ev,()=>fn.call(base.vm))
    }
  })
}

function initWatch(base) {
  let watchs = base.options.watch
  if (watchs) {
    let keys = Object.keys(watchs)
    keys.forEach(key => base.vm.hasOwnProperty(key) && base.watch(key, watchs[key]))
  }
}