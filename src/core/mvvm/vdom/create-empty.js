import Vnode from './vnode'
export default function createEmpty(text){
  if ( text === void 0 ) text = '';
  var node = new Vnode();
  node.text = text;
  node.isComment = true;
  return node
}