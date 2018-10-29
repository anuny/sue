import ready from './ready'

function dom(selector) {
  return new dom.fn.init(selector)
};
dom.ready = ready;
dom.fn = dom.prototype = {
  constructor: dom,
  init: function(selector) {
    if('string'===typeof selector){
      selector = document.querySelector(selector)
    };
    if(!selector || !selector.nodeType){
      return this
    }
    this.el = selector
    return this;
  },
  prev() {
    var parent = this.el.parentNode;
    if(!parent)return null;
    var tempFirst = parent.firstChild;
    if (this.el == tempFirst) return null;
    var tempObj = this.el.previousSibling;
    while (tempObj.nodeType != 1 && tempObj.previousSibling != null) {
      tempObj = tempObj.previousSibling;
    }
    return (tempObj.nodeType==1)? tempObj:null;
  },
  next() {
    var parent = this.el.parentNode;
    if(!parent)return null;
    var tempLast = parent.lastChild;
    if (this.el == tempLast) return null;
    var tempObj = this.el.nextSibling;
    while (tempObj.nodeType != 1 && tempObj.nextSibling != null) {
      tempObj = tempObj.nextSibling;
    }
    return (tempObj.nodeType==1)? tempObj:null;
  },
  appendChild(node){
    this.el.appendChild(node)
    return this
  },
  appendChildren(node){
    while (node.firstChild) {
      this.appendChild(node.firstChild)
    }
    return this
  },
  before (node) {
    var parent = this.el.parentNode
    parent.insertBefore(node, this.el)
    return this
  },
  after(node) {
    var parent = this.el.parentNode
    if (parent.lastChild === this.el) {
      parent.appendChild(node)
    } else {
      parent.insertBefore(node, this.el.nextSibling)
    } 
    return this
  },
  replaceWith:function(node){
    let parent =this.el.parentNode;
    parent && (parent !=node) && parent.replaceChild(node, this.el);
    return this
  },
  remove(){
    if (this.el.remove){
      this.el.remove();
    }else{
      let parent = this.el.parentNode || this.el.parentElement;
      parent && parent.removeChild(this.el)
    }
    this.el = null
    return this
  },
  attr: function(name, value) {
    if(value != undefined){
      this.el.setAttribute(name,value)
      return this
    }
    return this.el.getAttribute(name)
  },
  hasAttr(name){
    return this.el.hasAttribute(name)
    return this
  },
  removeAttr(name){
    this.el.removeAttribute(name)
    return this
  },
  fragment(){
    let fragment = document.createDocumentFragment();
    this.el = fragment;
    return this;
  },
  comment(str){
    let comment = document.createComment(str);
    this.el = comment;
    return this;
  },
  val(value){
    if(value){
      this.el.value = value
    }else{
      return this.el.value
    }
    return this
  },
  hasClass(className){
    return new RegExp("(\\s|^)" + className + "(\\s|$)").test(this.el.className);
  },
  addClass(className){
    if (!this.hasClass(className)){
      this.el.className = [ this.el.className, className].join(' ').replace(/(^\s+)|(\s+$)/g, '')
    } 
    return this
  },
  removeClass(className){
    if (this.hasClass(className)){
      this.el.className =  this.el.className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)', 'g'), ' ').replace(/(^\s+)|(\s+$)/g, '')
    } 
    return this
  },
  text(text){
    if(!this.el || !this.el.nodeType){
      this.el = document.createTextNode(text)
      return this;
    }
    if(text+=''){
      this.el.textContent = text
    }else{
      return this.el.textContent
    }
    return this
  },
  css(prop, value){
   if (value == undefined) {
      if ("object" === typeof prop) {
        for (var k in prop) this.el.style[k] = prop[k];
      } else {
        let getStyle = window.getComputedStyle(this.el) || this.el.currentStyle;
        return getStyle[prop]
      }
    } else {
      this.el.style[prop] = value;
    }
    return this
  },
  isText(){
    return this.el.nodeType == 3;
  },
  isElement(){
    return this.el.nodeType == 1;
  }
};
dom.fn.init.prototype = dom.fn;
export default dom