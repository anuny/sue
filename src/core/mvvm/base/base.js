
import {mount} from './mount'
import {watch} from './watch'
import {update} from './update'

import {
  createElement,
  createText,
  createList
} from '../render'

import {string} from '../util'

let uid = 0;
export default function Base(){

  // 唯一ID
	this.id = ++uid

  // 监听列表
  this.watchers = []

  // 子组件
  this.children = []

  // 节点
  this.els = {}

  // 数据
  this.data = {}

  // 参数
  this.props = {}

  // 配置
  this.options= {}

  // 初始状态
  this.isFui = true

  // 挂载状态
  this.isMounted = false

  // 挂载函数
  this.mount = mount

  // 监听函数
  this.watch = watch

  // 更新函数
  this.update = update
}

// 创建节点
Base.prototype._e = createElement

// 创建文本
Base.prototype._t = createText

// 创建for循环
Base.prototype._l = createList

// 转换为字符串
Base.prototype._s = string