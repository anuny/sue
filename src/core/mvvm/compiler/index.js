import generate from './generate'
import baseOptions from './base-options'

export default function compile($){

  let code   = generate($.ast, baseOptions)
  let render = createFunction(code.render)

  $._h = function element(tag, props, children, normalizationType){
    return $._e.call($,tag, props, children, normalizationType, false)
  }

  Fui.compiled[$.id] = $.vm

  return render
};

function createFunction (code) {
  try {
    return new Function(code)
  } catch (err) {
    return function noop (a, b, c) {}
  }
}
