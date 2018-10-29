import type from '@helper/type';

function Event(vm) {
  vm = vm || {}
  var callbacks = {},id=0;

  vm.on = function(event, callback) {
    if (type(callback).isFunction) {
      if (type(callback.id).isUndefined) callback.uid = id++
      event.replace(/\S+/g, function(name, pos) {
        (callbacks[name] = callbacks[name] || []).push(callback)
        callback.typed = pos > 0
      })
    }
    return vm
  }

  vm.off = function(event, callback) {
    if (event == '*') callbacks = {}
    else {
      event.replace(/\S+/g, function(name) {
        if (callback) {
          var arr = callbacks[name]
          for (var i = 0, cb; (cb = arr && arr[i]); ++i) {
            if (cb.uid == callback.uid) arr.splice(i--, 1)
          }
        } else {
          callbacks[name] = []
        }
      })
    }
    return vm
  }

  vm.one = function(event, callback) {
    function on() {
      vm.off(event, on)
      callback.apply(vm, arguments)
    }
    return vm.on(events, on)
  }

  vm.emit = function(event) {
    var args = [].slice.call(arguments, 1), fns = callbacks[event] || []
    for (var i = 0, fn; (fn = fns[i]); ++i) {
      if (!fn.busy) {
        fn.busy = 1
        fn.apply(vm, fn.typed ? [event].concat(args) : args)
        if (fns[i] !== fn) { i-- }
        fn.busy = 0
      }
    }
    if (callbacks.all && event != '*') {
      vm.emit.apply(vm, ['*', event].concat(args))
    }
    return vm
  }
  return vm
}

export default Event