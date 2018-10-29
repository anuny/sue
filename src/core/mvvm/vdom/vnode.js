export default function Vnode(tag, data={}, children=[], text, context){
  this.tag = tag
  this.data = data
  this.children = children
  this.text = text
  this.context = context;
  this.isStatic = false
  this.isComment = false;
}

Object.defineProperties( Vnode.prototype, {
	child: {
		configurable: true,
		get(){
			return this.componentInstance
		}
	}
});