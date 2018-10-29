import {type, Dep, def} from'../util'
import arrayMethods from './array'


export default function observe(data) {
  if (!data || typeof data !== 'object') {
    return
  }
  let ob
  if (data.hasOwnProperty('__ob__') && data.__ob__ instanceof Observer) {
    ob = data.__ob__
  } else if (!data.$ || !data.$.isFui) {
    ob = new Observer(data)
  }
  return ob
}

// 对数据进行监听
function Observer(data) {
  this.dep = new Dep()
  def(data, '__ob__', this)
  if (type(data).isArray) {
    data.__proto__ = arrayMethods
    this.observeArray(data)
  } else {
    this.walk(data)
  }
}

Observer.prototype = {
  walk(data) {
    let keys = Object.keys(data) 
    keys.forEach(key=>defineReactive(data, key, data[key]))
  },

  observeArray(arry) {
    arry.forEach(item => observe(item))
  }
}

function defineReactive(obj, key, val) {

  const dep = new Dep()
  // 递归监听
  let child = observe(val)
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {      
      // 收集对应的观察者对象
      if (Dep.target) {
        dep.depend()
        child && child.dep.depend()
        if (type(val).isArray) val.forEach(v=> v.__ob__ && v.__ob__.dep.depend())
      }
      return val
    },
    set(newVal) {
      if (val === newVal) {
        return
      }
      val = newVal
      // 递归监听
      child = observe(newVal)
      // 触发更新
      dep.notify()
    }
  })
}