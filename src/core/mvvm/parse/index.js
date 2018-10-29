import parse from './parse'
import optimize from './optimize'

export default function parseAst(options) {
  let ast = parse(options.element,{
    comment:options.comment
  })
  options.optimize && optimize(ast)
  return ast
}