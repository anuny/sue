export default function proxy(vm,data){
  Object.keys(data).forEach(key=>defineReactive(vm, data, key ))
}
function defineReactive(vm, data, key) {
  Object.defineProperty(vm, key, {
    enumerable: true,
    configurable: true,
    get() {
      return data[key];
    },
    set(val) {
      data[key] = val;
    }
  })
}