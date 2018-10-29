const empty = ['area','base','basefont','br','col','frame','hr','img','input','link','meta','param','embed','command','keygen','source','track','wbr'];

export default function parseElement(node,handler) {
  if(!(node instanceof Node)){
    node = domify(node)
  }
  const tag = node.tagName && node.tagName.toLowerCase();
  const attrs = getAttrs(node)
  const type = node.nodeType
  if(type ===1){
    const children = [].slice.call(node.childNodes);
    const unary = empty.indexOf(tag)>=0
  	handler.start && handler.start(tag, attrs, !!unary)
  	children.forEach(child=>parseElement(child,handler))
  	handler.end && handler.end(tag)
  }else{
    const text = node.nodeValue || node.textContent;
    const isText = text.trim() != '';
    if(isText){
      if(type===3){
        handler.chars && handler.chars(text)
      }else if(type===8){
        handler.comment && handler.comment(text)
      }
    }
  } 
}

function getAttrs (node) {
  const attrs = []
  const attributes = [].slice.call(node && node.attributes||attrs);
  let name, value;
  attributes.forEach(attr=>{
    name = attr.name
    value = attr.value
    attrs.push({name,value})
  })
  return attrs
}

function domify(DOMString) {
  var div = document.createElement('div')
  div.innerHTML = DOMString;
  return div.childNodes[0];
}