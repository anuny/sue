import {dom as $} from '../util'

export default function patch(oldNode,newNode){
  if(sameVnode(oldNode,newNode)){
    //如果两个Vnode节点的根一致  开始diff
    patchVnode(oldNode,newNode)
  }else{
    //这里就是不借助diff的实现
    const oel = oldNode.el;

    const parentEl = $.parentNode(oel);
    const nextEl   = $.nextSibling(oel)
    createElm(newNode,parentEl,nextEl)
    if(parentEl != null){
      removeVnodes(parentEl,[oldNode],0,0)
    }
  }
  return newNode.el;
}

function diffProps(oldNode, newNode) {
  var count = 0;
  var oldProps = oldNode.props;
  var newProps = newNode.props;
  var key, value;
  var propsPatches = {};

  //找出不同的属性
  for (key in oldProps) {
    value = oldProps[key];
    if (newProps[key] != value) {
      count++;
      propsPatches[key] = newProps[key];
    }
  };

  //找出新增的属性
  for (key in newProps) {
    value = newProps[key];
    if (!oldProps.hasOwnProperty(key)) {
      count++;
      propsPatches[key] = newProps[key];
    }
  }

  if (count === 0) {
    return null;
  }

  return propsPatches;
}

function patchVnode(oldNode,newNode){
  if(oldNode === newNode) return
  const el = newNode.el = oldNode.el
  const oldChildren = oldNode.children;
  const newChildren = newNode.children


  //非文本节点
  if(isUndef(newNode.text)){

    // 更新属性
    if (oldNode.tagName === newNode.tagName && oldNode.key === newNode.key) {
      let propsPatches = diffProps(oldNode, newNode);
      updateProps(el,propsPatches);
    }
    
    //都有字节点
    if(isDef(oldChildren) && isDef(newChildren)){
      //更新children
      if(oldChildren !== newChildren){
        updateChildren(el,oldChildren,newChildren);
      }
    }else if(isDef(newChildren)){
      //新的有子节点，老的没有
      if(isDef(oldNode.text)){
        $.setTextContent(el,'');
      }
      //添加子节点
      addVnodes(el,null,newChildren,0,newChildren.length-1)
    }else if(isDef(oldChildren)){
      //老的有子节点，新的没有
      removeVnodes(el,oldChildren,0,oldChildren.length-1)
    }else if(isDef(oldNode.text)){
      //否则老的有文本内容 直接置空就行
      $.setTextContent(el,'');
    }
  }else if(oldNode.text !== newNode.text){
    //直接修改文本
    $.setTextContent(el,newNode.text);
  }
}


function updateProps(el,propsPatches){
  for(let prop in propsPatches) $.setAttribute(el,prop,propsPatches[prop])
}

function updateChildren(parentElm,oldChildren,newChildren){
  let oldStartIdx = 0;
  let newStartIdx =0;
  let oldEndIdx = oldChildren.length -1;
  let oldStartVnode = oldChildren[0];
  let oldEndVnode = oldChildren[oldEndIdx];
  let newEndIdx = newChildren.length-1;
  let newStartVnode = newChildren[0]
  let newEndVnode = newChildren[newEndIdx]
  let refElm;

  while(oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx){
    if(isUndef(oldStartVnode)){
      oldStartVnode = oldChildren[++oldStartIdx]
    }else if(isUndef(oldEndVnode)){
      oldEndVnode = oldChildren[--oldEndIdx]
    }else if(sameVnode(oldStartVnode,newStartVnode)){

      patchVnode(oldStartVnode,newStartVnode)
      oldStartVnode = oldChildren[++oldStartIdx]
      newStartVnode = newChildren[++newStartIdx]

    }else if(sameVnode(oldEndVnode,newEndVnode)){

      patchVnode(oldEndVnode,newEndVnode)
      oldEndVnode = oldChildren[--oldEndIdx];
      newEndVnode = newChildren[--newEndIdx];
    }else if(sameVnode(oldStartVnode,newEndVnode)){

      patchVnode(oldStartVnode,newEndVnode);
      //更换顺序
      $.insertBefore(parentElm,oldStartVnode.el,$.nextSibling(oldEndVnode.el))
      oldStartVnode = oldChildren[++oldStartIdx]
      newEndVnode = newChildren[--newEndIdx]
    }else if(sameVnode(oldEndVnode,newStartVnode)){
      patchVnode(oldEndVnode,newStartVnode)
      odeOps.insertBefore(parentElm,oldEndVnode.el,oldStartVnode.el)
      oldEndVnode = oldChildren[--oldEndIdx]
      newStartVnode = newChildren[++newStartIdx]
    }else{

      createElm(newStartVnode,parentElm,oldStartVnode.el)
      newStartVnode = newChildren[++newStartIdx];
    }
  }

  if(oldStartIdx > oldEndIdx){
    //老的提前相遇，添加新节点中没有比较的节点
    refElm = isUndef(newChildren[newEndIdx + 1]) ? null : newChildren[newEndIdx+1].el
    addVnodes(parentElm,refElm,newChildren,newStartIdx,newEndIdx)
  }else{
    //新的提前相遇  删除多余的节点
    removeVnodes(parentElm,oldChildren,oldStartIdx,oldEndIdx)
  }
}

function addVnodes(parentElm,refElm,vnodes,startIdx,endIdx){
  for(;startIdx <=endIdx;++startIdx ){
    createElm(vnodes[startIdx],parentElm,refElm)
  }
}

function sameVnode(vnode1,vnode2){
  return vnode1.tag === vnode2.tag
}
function removeNode(el){
  const parent = $.parentNode(el)
  if(parent){
    $.removeChild(parent,el)
  }
}
function removeVnodes(parentElm,vnodes,startIdx,endIdx){
  for(;startIdx<=endIdx;++startIdx){
    const ch = vnodes[startIdx]
    if(isDef(ch)){
      removeNode(ch.el)
    }
  }
}
function isDef (s){
  return s != null
}
function isUndef(s){
  return s == null
}
function createChildren(vnode,children){
  if(Array.isArray(children)){
    for(let i=0;i<children.length;i++){
      createElm(children[i],vnode.el,null)
    }
  }
}
function createElm(vnode,parentElm,refElm){
  const children = vnode.children
  const tag = vnode.tag
  if(isDef(tag)){
    // 非文本节点
    vnode.el = $.createElement(tag); // 其实可以初始化的时候就赋予
    createChildren(vnode,children);
    insert(parentElm,vnode.el,refElm)
  }else{
    vnode.el = $.createTextNode(vnode.text)
    insert(parentElm,vnode.el,refElm)
  }
}
function insert(parent,el,ref){
  if(parent){
    if(ref){
      $.insertBefore(parent,el,ref)
    }else{
      $.appendChild(parent,el)
    }
  }
}