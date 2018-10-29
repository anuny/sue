import {type} from '../../util'
import {createText} from '../../vdom'

export default function normalizeArrayChildren (children, nestedIndex) {
  var res = [];
  var i, c, lastIndex, last;
  for (i = 0; i < children.length; i++) {
    c = children[i];
    if (!c || type(c).isBoolean) { continue }
    lastIndex = res.length - 1;
    last = res[lastIndex];
    //  nested
    if (type(c).isArray) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
        // merge adjacent text nodes
        if (isTextNode(c[0]) && isTextNode(last)) {
          res[lastIndex] = createText(last.text + (c[0]).text);
          c.shift();
        }
        res.push.apply(res, c);
      }
    } else if (type(c).isPrimitive) {
      if (isTextNode(last)) {
        res[lastIndex] = createText(last.text + c);
      } else if (c !== '') {
        res.push(createText(c));
      }
    } else {
      if (isTextNode(c) && isTextNode(last)) {
        res[lastIndex] = createText(last.text + c.text);
      } else {
        if (children.isFui && c.tag && c.key &&  nestedIndex) {
          c.key = "__list" + nestedIndex + "_" + i + "__";
        }
        res.push(c);
      }
    }
  }
  return res
}

function isTextNode (node) {
  return node && node.text && node.isComment === false
}