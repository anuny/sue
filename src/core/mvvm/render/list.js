import {type} from '../util'

export function createList(val,render){
	var ret, i, l, keys, key;
  if (type(val).isArray || type(val).isString) {
    ret = new Array(val.length);
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (type(val).isNumber) {
    ret = new Array(val);
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (type(val).isObject) {
    keys = Object.keys(val);
    ret = new Array(keys.length);
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      ret[i] = render(val[key], key, i);
    }
  }
  if (ret) {
    ret.isList = true;
  }
  return ret
}