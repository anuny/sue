import {string} from '../util'
import Vnode from './vnode'
export default function createText(text){
  return new Vnode(undefined, undefined, undefined, string(text))
}