import {type} from '../../util'
import {createText} from '../../vdom'
import normalizeArrayChildren from './normalize-array-children'

export default function normalizeChildren (children) {
  return type(children).isPrimitive? [createText(children)]: type(children).isArray? normalizeArrayChildren(children): undefined
}