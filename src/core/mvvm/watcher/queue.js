import {nextTick}  from '../util'

const queue = []
let has = {}
let waiting = false

export default function queueWatcher(watcher) {
  const id = watcher.id
  // 如果已经有相同的watcher则不添加 防止重复更新
  if (has[id] == null) {
    has[id] = queue.length
    queue.push(watcher)
  }

  if (!waiting) {
    waiting = true
    nextTick(flushQueue)
  }
}

function flushQueue() {
  queue.forEach(q => q.run())
  
  // 重置
  waiting = false
  has = {}
  queue.length = 0
}