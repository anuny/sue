import {type} from '../../util'
export default function simpleNormalizeChildren (children) {
  for (var i = 0; i < children.length; i++) {
    if (type(children[i]).isArray) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}