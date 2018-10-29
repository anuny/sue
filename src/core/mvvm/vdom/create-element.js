import {type, resolveAsset} from '../util'
import Vnode from './vnode'
import createEmpty from './create-empty'

import {normalizeChildren, simpleNormalizeChildren} from './helper'
import createComponent from './create-component'

var SIMPLE_NORMALIZE = 1;
var ALWAYS_NORMALIZE = 2;

export default function createElement (context,tag,data={},children=[],normalizationType,alwaysNormalize) {

  if (type(data).isArray || type(data).isPrimitive) {
    normalizationType = children;
    children = data;
    data = undefined;
  }
  if (alwaysNormalize=== true) {
    normalizationType = ALWAYS_NORMALIZE;
  }
  return _createElement(context, tag, data, children, normalizationType)
}

function _createElement (context,tag,data,children,normalizationType) {
  if (data && data.__ob__) {
    console.log('error render/create-element');
    return createEmptyVnode()
  }

  if (data && data.is) {
    tag = data.is;
  }
  if (!tag) {
    return createEmptyVnode()
  }
  // warn against non-primitive key
  if (data && data.key && !type(data.key).isPrimitive) {
    console.log('error render/create-element non-primitive value as key');
  }

  // support single function children as default scoped slot
  if (type(children).isArray && type(children[0]).isFunction) {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }
  var vnode;
  if (typeof tag === 'string') {
    vnode = new Vnode(tag, data, children,undefined, context);
  } else {
    vnode = createComponent(tag, data, context, children);
  }
  if (type(vnode).isObject) {
    return vnode
  } else {
    return createEmpty()
  }
}