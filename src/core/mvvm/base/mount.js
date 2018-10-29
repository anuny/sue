import parse from '../parse'
import Watcher from '../watcher'
import compile from '../compiler'

export function mount(el)
{
	el = query(el, this.options)

	// 没有dom节点或已经挂载
	if(this.isMounted || !el) return this;

	this.el = el

  // 解析模板
  this.ast = parse({
  	element:this.el,
  	comment:true,
  	optimize:true
  })

	// 编译渲染
	this.render = compile(this);

	this.emit('beforeMount')

	// 挂载和监听
	mountComponent(this.vm)

	// 标记和通知
	this.isMounted = true
	this.emit('mounted')
	return this
}


function mountComponent (vm){
  new Watcher(vm, function(vm){
  	this.$.update(this.$.render.call(this));
  });
}

function query(el, options)
{
	// 获取挂载点
	if(el instanceof Node){
    el = el
  }else{
    el = document.querySelector(el)
  }

  if(!el) return;

  // 获取模板
  if(options.template){
  	let div = document.createElement('div')
  	div.innerHTML = options.template
  	let node = div.children[0]
  	if(!node) return el

  	let parent = el.parentNode;
    parent && parent.replaceChild(node, el);
    el = node
  }
  return el
}