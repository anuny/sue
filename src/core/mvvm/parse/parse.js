import parseElement from './parse-element'
import parseText from './parse-text'

import {
  processFor, 
  processIf, 
  processOnce,
  processKey,
  processRef, 
  processAttrs,
  addIfCondition, 
  processIfConditions
} from './process'

export default function parse(node, options) {
  let root;
  let parent;
  let stack = [];

  let handler = {
    start(tag, attrs, unary){

      // 创建vNode
      let element = new AST(tag, attrs, parent);

      /*匹配v-for属性*/
      processFor(element)

      /*匹配if属性，分别处理v-if、v-else以及v-else-if属性*/
      processIf(element)

      processOnce(element)

      processKey(element)

      /*去掉属性后，确定这是一个普通元素。*/
      element.plain = !element.key && !attrs.length

      processRef(element)

      processAttrs(element)

      
      if (!root) {
        // 设置根元素节点
        root = element
      } else if (!stack.length) {
        if (root.if && (element.elseif || element.else)) {
          addIfCondition(root, {
            exp: element.elseif,
            block: element
          })
        }
      }

      // 设置元素的父节点，将当前元素的添加到父节点的children中
      if (parent) {

        if (element.elseif || element.else) {

          /*当遇到当前ele有v-else或者v-elseif属性的时候，需要处理if属性，在其上级兄弟元素中必然存在一个v-if属性*/
          processIfConditions(element, parent)
        }else {
          parent.children.push(element)
          element.parent = parent
        }
      }

      // 设置父节点为当前元素
      if (!unary) {
        parent = element;
        stack.push(element);
      }
    },
    end(tag) {
      // 将匹配结束的标签出栈，修改父节点为之前上一个元素
      let element = stack.pop();
      parent = stack[stack.length - 1];
    },
    chars(text){
      // 保存文本
      if (!parent) return
      let children = parent.children;
      let exp;
      text = text.trim()
      if (text) {
      	// 如果文本节点包含表达式
	      if (exp = parseText(text)) {
	        children.push({ 
            type: 2, 
            exp, 
            text 
          })
	      } else {
	        children.push({ 
            type: 3, 
            text 
          })
	      }
      }  
    }
  }
  if(options.comment){
    handler.comment = text => parent.children.push({
      type: 3, 
      text, 
      isComment: true
    })
  }

  parseElement(node,handler)
  return root
}

function AST(tag, attrs=[], parent){
  this.type = 1
  this.tag = tag
  this.attrs = attrs
  this.attrsMap= makeAttrsMap(attrs)
  this.parent = parent
  this.children = []
}

function makeAttrsMap (attrs) {
  var map = {};
  for (var i = 0, l = attrs.length; i < l; i++) {
    map[attrs[i].name] = attrs[i].value;
  }
  return map
}


