import CodegenState from './code-gen-state'
import genElement from './gen-element'

export default function generate (ast,options) {
  let state = new CodegenState(options);
  let code = ast ? genElement(ast, state) : '$._h("div")';
  return {
    render: (`with(this){return (${code})}`),
    staticRenderFns: state.staticRenderFns
  }
}