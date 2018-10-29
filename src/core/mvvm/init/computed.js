import {type} from '../util';
export default function (vm, options={}) {
  for (let prop in options) {
    let descriptor = options[prop];
    if (type(descriptor).isFunction) {
      descriptor = {
        get: descriptor
      };
      descriptor.enumerable = true;
      descriptor.configurable = true;
      Object.defineProperty(vm, prop, descriptor);
    }
  }
}