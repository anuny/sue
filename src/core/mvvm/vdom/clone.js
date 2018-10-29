import Vnode from './vnode'
export default function cloneVnode(vnode) {
  let node = new Vnode(vnode.tag,vnode.data,vnode.children,vnode.text,vnode.context);
  node.isStatic = vnode.isStatic;
  node.isComment = vnode.isComment;
  node.isCloned = true;
  return node
}