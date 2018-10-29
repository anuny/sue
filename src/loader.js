const { getOptions } = require('loader-utils')

var BOOL_ATTR = ('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,'+
  'defaultchecked,defaultmuted,defaultselected,defer,disabled,draggable,enabled,formnovalidate,hidden,'+
  'indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,'+
  'pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,spellcheck,translate,truespeed,'+
  'typemustmatch,visible').split(',')


var CUSTOM_TAG = /^<([\w\-]+)>([^\x00]*[\w\/]>$)([^\x00]*?)^<\/\1>/im,
    SCRIPT = /<script(\s+type=['"]?([^>'"]+)['"]?)?>([^\x00]*?)<\/script>/im,
    IMPORT_STATEMENT = /^\s*import(?!\w)(?:(?:\s|[^\s'"])*)['|"].*\n?/gm,
    HTML_COMMENT = /<!--.*?-->/g,
    CLOSED_TAG = /<([\w\-]+)([^\/]*)\/\s*>/g,
    LINE_COMMENT = /^\s*\/\/.*$/gm,
    JS_COMMENT = /\/\*[^\x00]*?\*\//gm


function compileHTML(html, opts) {

  // whitespace
  html = html.replace(/\s+/g, ' ')

  // strip comments
  html = html.trim().replace(HTML_COMMENT, '')

  // foo={ bar } --> foo="{ bar }"
  html = html.replace(/=(\{[^\}]+\})([\s\>])/g, '="$1"$2')

  // IE8 looses boolean attr values: `checked={ expr }` --> `__checked={ expr }`
  html = html.replace(/([\w\-]+)=["'](\{[^\}]+\})["']/g, function(full, name, expr) {
    if (BOOL_ATTR.indexOf(name.toLowerCase()) >= 0) name = '__' + name
    return name + '="' + expr + '"'
  })

  // <foo/> -> <foo></foo>
  html = html.replace(CLOSED_TAG, function(_, tagName, attr) {
    return '<' + tagName + (attr ? ' ' + attr.trim() : '') + '></' + tagName + '>'
  })

  // escape single quotes
  html = html.replace(/'/g, "\\'")


  // \{ jotain \} --> \\{ jotain \\}
  html = html.replace(/\\[{}]/g, '\\$&')

  // compact: no whitespace between tags
  if (opts.compact) html = html.replace(/> </g, '><')

  return html

}


var parseJs = {
  coffeescript: function (js,opts) {
    return require('coffee-script').compile(js, { bare: true })
  },
  es6: function (js,opts) {
    let filename = opts.filename;
    try {
      return require('@babel/core').transform(js,{filename}).code
    } catch (_) {
      //console.log('Fallback to babel-core. You might want to upgrade to @babel/core soon.')
      return require('babel-core').transform(js,{filename}).code
    }
  },
  none: function (js) {
    return js
  },
  fuijs: function (js,opts) {
    // 删除注释
    js = js.replace(LINE_COMMENT, '').replace(JS_COMMENT, '')

    // ES6 方法名
    let lines = js.split('\n'), es6_ident = ''

    lines.forEach(function(line, i) {
      let l = line.trim()

      // 方法名开始
      if (l[0] != '}' && l.indexOf('(') > 0 && l.slice(-1) == '{' && l.indexOf('function') == -1) {
        var m = /(\s+)([\w]+)\s*\(([\w,\s]*)\)\s*\{/.exec(line)
        if (m && !/^(if|while|switch|for)$/.test(m[2])) {
          lines[i] = m[1] + 'this.' + m[2] + ' = function(' + m[3] + ') {'
          es6_ident = m[1]
        }
      }

      // 方法名结束
      if (line.slice(0, es6_ident.length + 1) == es6_ident + '}') {
        lines[i] += '.bind(this);'
        es6_ident = ''
      }

    })
    return lines.join('\n')
  }
}


function compileJS(js, opts, type) {
  //js = 'fui.compile(this,'+js.trim()+')'
  var parser = opts.parser || (type ? parseJs[type] : parseJs.fuijs)
  if (!parser) throw new Error('Parser not found "' + type + '"')
  return parser(js, opts)
}


function compile(source, opts) {
  opts = opts || {}

  let included = function (s) {
    return opts.exclude ? opts.exclude.indexOf(s) < 0 : true
  }
  let head=';(function(){'
  let foot='})(Fui);'

  let imports = '';

  let tpls = source.match(CUSTOM_TAG);
  let tagName = tpls[1]
  let template = compileHTML(tpls[2], opts)

  
  let scripts = source.match(SCRIPT);
  let scriptType = scripts[1]
  if (scriptType) scriptType = scriptType.replace('text/', '')
  if(!scriptType || scriptType==''){
    scriptType = opts.type
  }
  let _script = scripts[3];


  if(included('js')){
    _script = _script.replace(IMPORT_STATEMENT, function (s) {
      imports += s.trim() + '\n'
      return ''
    })
  }
  let script = `let extend=${_script}`
  script = compileJS(script, opts, scriptType)
  return `${imports}${script}Fui.component('${tagName}','${template}',extend)`
}



module.exports = function(source) {
  const query = getOptions(this) || {}
  const opts = Object.keys(query).reduce(function(acc, key) {
    acc[key.replace('?', '')] = query[key]
    return acc
  }, {})

  opts.sourcemap = opts.sourcemap !== false && this.sourceMap
  opts.filename = this.resourcePath

  const code = compile(source,opts)
  if (this.cacheable) this.cacheable()
  return code
}