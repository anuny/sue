import {compiled, components, component, Base} from './base'
import init from './init'

export default function Fui(options={}){
  init(this,options) 
}
// 避免污染对象，把内置对象映射到 vm.$
Fui.prototype.$ = new Base()

// 已挂载
Fui.compiled = compiled

// 全局组件
Fui.components = components

// 注册组件
Fui.component = component