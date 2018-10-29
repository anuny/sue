
import parseText from './parse-text'
import {parseFilters} from './parse-filter'

import {
  addProp,
  addAttr,
  addHandler,
  addDirective,
  getBindingAttr,
  getAndRemoveAttr,
  pluckModuleFunction
} from './helper'


/*匹配@以及v-on，绑定事件 */
const onRE = /^@/
/*匹配v-、@以及:*/
const dirRE = /^f-|^@|^:/
/*匹配v-for中的in以及of*/
const forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/
const forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/

const argRE = /:(.*)$/
/*匹配v-bind以及:*/
const bindRE = /^:/
/*根据点来分开各个级别的正则，比如a.b.c.d解析后可以得到.b .c .d*/
const modifierRE = /\.[^.]+/g

let delimiters
let platformMustUseProp = function(){}


/*匹配v-for属性*/
export function processFor (el) {


  let exp

  // 取出for属性
  if ((exp = getAndRemoveAttr(el, 'for'))) {

    // 匹配for中的in以及of
    const inMatch = exp.match(forAliasRE)
    if (!inMatch)return
    el.for = inMatch[2].trim()

    const alias = inMatch[1].trim()
    const iteratorMatch = alias.match(forIteratorRE)
    if (iteratorMatch) {
      el.alias = iteratorMatch[1].trim()
      el.key = iteratorMatch[2].trim()
      if (iteratorMatch[3]) {
        el.index = iteratorMatch[3].trim()
      }
    } else {
      el.alias = alias
    }
  }
}


// 匹配if属性，分别处理v-if、v-else以及v-else-if属性
export function processIf (el) {
  // 取出v-if属性
  const exp = getAndRemoveAttr(el, 'if')
  if (exp) {
    
    // 存在v-if属性
    el.if = exp

    // 加入ifConditions
    addIfCondition(el, {
      exp,
      block: el
    })
  } else {
    // 存在else属性
    if (getAndRemoveAttr(el, 'else') != null) {
      el.else = true
    }
    
    // 存在else-if属性
    const elseif = getAndRemoveAttr(el, 'else-if')
    if (elseif) {
      el.elseif = elseif
    }
  }
}

// 处理if条件
export function processIfConditions (el, parent) {
  // 当遇到当前ele有v-else或者v-elseif属性的时候，需要处理if属性，在其上级兄弟元素中必然存在v-if属性
  const prev = findPrevElement(parent.children)
  if (prev && prev.if) {
    addIfCondition(prev, {
      exp: el.elseif,
      block: el
    })
  } else {
    Fui.log('warn',`${el.elseif ? ('else-if="' + el.elseif + '"') : 'else'} used on element <${el.tag}> without corresponding if.`)
  }
}

// 找到上一个el
function findPrevElement (children){
  let i = children.length
  while (i--) {
    if (children[i].type === 1) {
      return children[i]
    } else {
      if (children[i].text !== ' ') {
        Fui.log('warn',`text "${children[i].text.trim()}" between if and else(-if) will be ignored.`)
      }
      children.pop()
    }
  }
}

/*在el的ifConditions属性中加入condition*/
export function addIfCondition (el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = []
  }
  el.ifConditions.push(condition)
}

/*处理v-once属性，https://cn.vuejs.org/v2/api/#v-once*/
export function processOnce (el) {
  const once = getAndRemoveAttr(el, 'once')
  if (once != null) {
    el.once = true
  }
}

/*处理key属性 https://cn.vuejs.org/v2/api/#key*/
export function processKey (el) {
  const exp = getBindingAttr(el, 'key')
  if (exp) {
    if (el.tag === 'template') {
      warn(`<template> cannot be keyed. Place the key on real elements instead.`)
    }
    el.key = exp
  }
}

export function processRef (el) {
  const ref = getBindingAttr(el, 'ref')
  if (ref) {
    el.ref = ref
    /*
      检测该元素是否存在一个for循环中。
      将会沿着parent元素一级一级向上便利寻找是否处于一个for循环中。
      当 v-for 用于元素或组件的时候，引用信息将是包含 DOM 节点或组件实例的数组。
    */
    el.refInFor = checkInFor(el)
  }
}

/*检测该元素是否存在一个for循环中，将会沿着parent元素一级一级向上便利寻找是否处于一个for循环中。*/
function checkInFor (el) {
  let parent = el
  while (parent) {
    if (parent.for !== undefined) {
      return true
    }
    parent = parent.parent
  }
  return false
}

/*处理属性*/
export function processAttrs (el) {
  /*获取元素属性列表*/
  const list = el.attrs
  let i, l, name, rawName, value, modifiers, isProp
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name
    value = list[i].value
    /*匹配v-、@以及:，处理ele的特殊属性*/
    if (dirRE.test(name)) {
      /*标记该ele为动态的*/
      // mark element as dynamic
      el.hasBindings = true
      // modifiers
      /*解析表达式，比如a.b.c.d得到结果{b: true, c: true, d:true}*/
      modifiers = parseModifiers(name)
      if (modifiers) {
        /*得到第一级，比如a.b.c.d得到a，也就是上面的操作把所有子级取出来，这个把第一级取出来*/
        name = name.replace(modifierRE, '')
      }
      /*如果属性是v-bind的*/
      if (bindRE.test(name)) { // v-bind
        /*这样处理以后v-bind:aaa得到aaa*/
        name = name.replace(bindRE, '')
        /*解析过滤器*/
        value = parseFilters(value)
        isProp = false
        if (modifiers) {
          /*
              https://cn.vuejs.org/v2/api/#v-bind
              这里用来处理v-bind的修饰符
          */
          /*.prop - 被用于绑定 DOM 属性。*/
          if (modifiers.prop) {
            isProp = true
             /*将原本用-连接的字符串变成驼峰 aaa-bbb-ccc => aaaBbbCcc*/
            name = camelize(name)
            if (name === 'innerHtml') name = 'innerHTML'
          }
          /*.camel - (2.1.0+) 将 kebab-case 特性名转换为 camelCase. (从 2.1.0 开始支持)*/
          if (modifiers.camel) {
            name = camelize(name)
          }
          //.sync (2.3.0+) 语法糖，会扩展成一个更新父组件绑定值的 v-on 侦听器。
          if (modifiers.sync) {
            addHandler(
              el,
              `update:${camelize(name)}`,
              genAssignmentCode(value, `$event`)
            )
          }
        }
        if (isProp || platformMustUseProp(el.tag, el.attrsMap.type, name)) {
          /*将属性放入ele的props属性中*/
          addProp(el, name, value)
        } else {
          /*将属性放入ele的attr属性中*/
          addAttr(el, name, value)
        }
      } else if (onRE.test(name)) { // v-on
        /*处理v-on以及bind*/
        name = name.replace(onRE, '')
        addHandler(el, name, value, modifiers, false)
      } else { // normal directives
        /*去除@、:、v-*/
        name = name.replace(dirRE, '')
        // parse arg
        const argMatch = name.match(argRE)
        /*比如:fun="functionA"解析出fun="functionA"*/
        const arg = argMatch && argMatch[1]
        if (arg) {
          name = name.slice(0, -(arg.length + 1))
        }
        /*将参数加入到ele的directives中去*/
        addDirective(el, name, rawName, value, arg, modifiers)
        if (process.env.NODE_ENV !== 'production' && name === 'model') {
          checkForAliasModel(el, value)
        }
      }
    } else {
      /*处理常规的字符串属性*/
      // literal attribute
      if (process.env.NODE_ENV !== 'production') {
        const expression = parseText(value, delimiters)
        if (expression) {
          /*
            插入属性内部会被删除，请改用冒号或者v-bind
            比如应该用<div :id="test">来代替<div id="{{test}}">
          */
          warn(
            `${name}="${value}": ` +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div id="{{ val }}">, use <div :id="val">.'
          )
        }
      }
      /*将属性放入ele的attr属性中*/
      addAttr(el, name, JSON.stringify(value))
    }
  }
}

/*解析表达式，比如a.b.c.d得到结果{b: true, c: true, d:true}*/
function parseModifiers (name){
  /*根据点来分开各个级别的正则，比如a.b.c.d解析后可以得到.b .c .d*/
  const match = name.match(modifierRE)
  if (match) {
    const ret = {}
    match.forEach(m => { ret[m.slice(1)] = true })
    return ret
  }
}

function checkForAliasModel (el, value) {
  let _el = el
  while (_el) {
    if (_el.for && _el.alias === value) {
      warn(
        `<${el.tag} v-model="${value}">: ` +
        `You are binding v-model directly to a v-for iteration alias. ` +
        `This will not be able to modify the v-for source array because ` +
        `writing to the alias is like modifying a function local variable. ` +
        `Consider using an array of objects and use v-model on an object property instead.`
      )
    }
    _el = _el.parent
  }
}

