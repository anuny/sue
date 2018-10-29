import {Dep} from '../util'
import queue from './queue'

// watcher实例的ID 每个watcher实现的ID都是唯一的
let uid = 0
export default function Watcher(vm, exp, cb) {

  let sync = vm.$.options && vm.$.options.sync
  vm.$.watchers.push(this)

  this.id = ++uid
  this.vm = vm
  
  // props需要用到
  this.sync = !!sync

  // 计算属性需要用到
  this.dirty = this.lazy

  // 存放dep实例
  this.deps = []

  // 存放dep的ID
  this.depIds = new Set()

  // 更新触发回调函数
  this.cb = cb

  if (typeof exp === 'function') {  
    this.getter = exp
    this.setter = undefined
  } else { 
    this.getter = () => vm[exp]
    this.setter = (value) => vm[exp] = value
  }

  // 在创建watcher实例时先取一次值
  if (this.lazy) {
    this.value = undefined
  } else {
    this.value = this.get()
  }
}

Watcher.prototype = {
  get() {
    const vm = this.vm
    // 在读取值时先将观察者对象赋值给Dep.target 否则Dep.target为空 不会触发收集依赖
    Dep.target = this
    let value = this.getter ? this.getter.call(vm, vm):null;
    // 触发依赖后置为空
    Dep.target = null
    return value
  },

  set(value) {
    this.setter.call(this.vm, value)
  },

  update() {
    // 触发更新后执行回调函数
    // 如果没有同步标记 则异步更新
    // 假设原来在一个函数里同时执行age++ 4次 则会执行回调函数4次 
    // 异步更新则会执行一次 优化性能
    if (this.lazy) {
      this.dirty = true
    } else if (!this.sync) {
      queue(this)
    } else {
      this.run()
    }
  },

  run() {
    const value = this.get()
    const oldValue = this.value
    this.value = value
    if (value !== oldValue || typeof value === 'object') {
      this.cb && this.cb.call(this.vm, value, oldValue)
    }
  },

  addDep(dep) {
    // 触发依赖 dep添加观察者对象 同时观察者对象也会将dep实例添加到自己的deps里
    // 如果dep已经存在deps里 则不添加
    // dep中存放着对应的watcher watcher中也会存放着对应的dep
    // 一个dep可能有多个watcher 一个watcher也可能对应着多个dep
    if (!this.depIds.has(dep.id)) {
      this.deps.push(dep)
      this.depIds.add(dep.id)
      dep.addSub(this)
    }
  },

  teardown() {
    this.vm.$.watchers.splice(this.vm.$.watchers.indexOf(this), 1)
    let i = this.deps.length
    while (i--) {
      this.deps[i].removeSub(this)
    }
    this.vm = this.cb = this.value = null
  },

  evaluate() {
    const current = Dep.target
    this.value = this.get()
    this.dirty = false
    Dep.target = current
  },

  depend() {
    this.deps.forEach(dep => dep.depend())
  }
}