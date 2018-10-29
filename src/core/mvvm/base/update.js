import {Vnode,patch} from '../vdom'

export function update(vnode){
  let oldvNode = this.vNode;
  this.vNode = vnode

  // 第一次挂载
  if (!oldvNode) {
    oldvNode = new Vnode(undefined, undefined, undefined, undefined) 
    oldvNode.el = this.el
    this.el = patch(oldvNode,vnode);
  } else {
    this.emit('beforeUpdate')
    this.el = patch(oldvNode,vnode);
    this.emit('updated')
  }
}