/* @flow */


export function cached(fn) {
  const cache = Object.create(null)
  return (function cachedFn (str) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  })
}

const isBuiltInTag = makeMap('slot,component', true)

function makeMap (str,expectsLowerCase) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase? function (val) {
  	return map[val.toLowerCase()]; 
  }: function (val) { return map[val]; }
}


/*标记是否为静态属性*/
let isStaticKey


const genStaticKeysCached = cached(genStaticKeys)

 /*
  将AST树进行优化
  优化的目标：生成模板AST树，检测不需要进行DOM改变的静态子树。
  一旦检测到这些静态树，我们就能做以下这些事情：
  1.把它们变成常数，这样我们就再也不需要每次重新渲染时创建新的节点了。
  2.在patch的过程中直接跳过。
 */
export default function optimize (root, options={}) {
  if (!root) return

  /*标记是否为静态属性*/
  isStaticKey = genStaticKeysCached(options.staticKeys || '')

  /*处理所有非静态节点*/
  markStatic(root)

  /*处理static root*/
  markStaticRoots(root, false)
}

/*静态属性的map表*/
function genStaticKeys (keys) {
  return makeMap('type,tag,props,plain,parent,children' +(keys ? ',' + keys : ''),false)
}

/*处理所有非静态节点*/
function markStatic (node) {
  /*标记一个node节点是否是static的*/
  node.static = isStatic(node)
  if (node.type === 1) {
    /*遍历子节点*/
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      markStatic(child)
      /*如果子节点不是静态的，则本身也不是静态的*/
      if (!child.static) {
        node.static = false
      }
    }
  }
}

function markStaticRoots (node, isInFor) {
  if (node.type === 1) {
    if (node.static) {
      /*标记static的或者有v-once指令同时处于for循环中的节点*/
      node.staticInFor = isInFor
    }

    /*一个static root节点必须有子节点否则它可能只是一个static的文本节点，而且它不能只有文本子节点*/
    if (node.static && node.children.length && !(node.children.length === 1 && node.children[0].type === 3)) {
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }
    /*遍历子节点*/
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for)
      }
    }
    /*
      ifConditions存储了if条件。
      是一个数组，格式为[{exp: xxx, block:xxx}, {exp: xxx, block:xxx}, {exp: xxx, block:xxx}]
      block存储了element，exp存储了表达式。
    */
    if (node.ifConditions) {
      walkThroughConditionsBlocks(node.ifConditions, isInFor)
    }
  }
}

function walkThroughConditionsBlocks (conditionBlocks, isInFor) {
  for (let i = 1, len = conditionBlocks.length; i < len; i++) {
    markStaticRoots(conditionBlocks[i].block, isInFor)
  }
}

/*判断一个node节点是否是static的*/
function isStatic (node) {
	// 包含表达式
  if (node.type === 2) { // expression
    return false
  }
  // 纯文本
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || (!node.if && !node.for && !isBuiltInTag(node.tag) && !isDirectChildOfTemplateFor(node)))
}

function isDirectChildOfTemplateFor (node) {
  while (node.parent) {
    node = node.parent
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}