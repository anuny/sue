
/*处理element，分别处理static静态节点、v-for、v-if、template、slot以及组件或元素*/
export default function genElement (ast,state) {
  
  /*处理v-for*/
  if (ast.for && !ast.forProcessed) {
    return genFor(ast)

  /*处理v-if*/
  } else if (ast.if && !ast.ifProcessed) {
    return genIf(ast)
  } else {

    /*处理元素*/
    var data = ast.plain ? undefined : genData(ast);
    var children = genChildren(ast, true)
    var code = "$._h('" + (ast.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
    return code
  }
}

/*处理static静态节点*/
function genStatic (el) {
  /*处理过的标记位*/
  el.staticProcessed = true
  staticRenderFns.push(`with(this){return ${genElement(el)}}`)
  return `_m(${staticRenderFns.length - 1}${el.staticInFor ? ',true' : ''})`
}


/*处理v-if*/
function genIf (el) {
  el.ifProcessed = true; // avoid recursion
  return genIfConditions(el.ifConditions.slice())
}

/*处理if条件*/
function genIfConditions (conditions) {
  if (!conditions.length) return '$._h()'
  var condition = conditions.shift();
  if (condition.exp) {
    return `${condition.exp}?${genElement(condition.block)}:${genIfConditions(conditions)}`
  } else {
    return ("" + (genElement(condition.block)))
  }
}

/*处理v-for循环*/
function genFor (el) {
  let exp = el.for
  var alias = el.alias;
  var key = el.key || '';
  var index = el.index || '';

  if (!el.key) {
    console.log('[genFor Error]');
  }

  el.forProcessed = true;
  return `$._l(${exp},function(${alias},${key},${index}){
    return ${genElement(el)}
  })`
}



/*处理chidren*/
function genChildren (el,checkSkip) {
  var children = el.children;
  if (children.length) {
    var child = children[0];
    if (children.length === 1 && child.for) {
      return genElement(child)
    }
    var normalizationType = checkSkip? getNormalizationType(children): 0;
    return `[${children.map(genNode).join(',')}]${
      normalizationType ? `,${normalizationType}` : ''
    }`

  }
}


/*
  得到子数组所需的序列化类型
  0:不需要序列化
  1:需要做简单的序列化（可能是一级深层嵌套数组）
  2:需要完全序列化
*/
function getNormalizationType (children) {
  var res = 0;
  for (var i = 0; i < children.length; i++) {
    var el = children[i];
    /*当不是元素节点的时候直接continue*/
    if (el.type !== 1) {
      continue
    }
    /*if条件中是存在满足needsNormalization条件的*/
    if (needsNormalization(el) ||(el.ifConditions && el.ifConditions.some(c => needsNormalization(c.block)))) {
      res = 2;
      break
    }
    /*if条件中有满足有可能是组件的返回1*/
    // if ((el.ifConditions && el.ifConditions.some(c => maybeComponent(c.block)))) {
    //   res = 1;
    // }
  }
  return res
}

/*是否需要序列化（元素不是slot标签或者templete，同时不存在于v-for循环中）*/
function needsNormalization (el) {
  return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
}

/*处理节点*/
function genNode (node) {
  if (node.type === 1) {
    return genElement(node)
  } else {
    return genText(node)
  }
}

/*处理文本*/
function genText (el) {
  let exp = el.exp
  return `$._t(${el.type === 2?exp:transformSpecialNewlines(JSON.stringify(el.text))})`
}



function transformSpecialNewlines (text) {
  return text.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
}

function genData (el) {
  var data = '{';

  if (el.key) {
    data += `key:${el.key},`
  }

  if (el.props) {
    data += `props:{${genProps(el.props)}},`
  }
  
  if (el.model) {
    data += `model:{value:${el.model.value},callback:${el.model.callback},exp:${el.model.exp}},`
  }

  data = data.replace(/,$/, '') + '}';
  return data
}

function genProps (props) {
  let res=''
  for(let name in props){
    let value = props[name]
    res += `"${name}":"${transformSpecialNewlines(value)}",`
  }
  return res.slice(0, -1)
}


