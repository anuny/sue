import {def} from '../util'

const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)
const methods = ['push', 'pop','shift','unshift','splice','sort','reverse']

methods.forEach( method => {
  // 缓存原型自身的方法
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator(...args) {
    // 先执行原型自身的方法
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) {
      ob.observeArray(inserted)
    }
    // 触发依赖更新
    ob.dep.notify()
    return result
  })
})
export default arrayMethods