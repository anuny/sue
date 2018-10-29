
function addProp (el, name, value) {
  (el.props || (el.props = [])).push({ name: name, value: value });
  el.plain = false;
}

let directives = {
  text: function text (el, dir) {
    if (dir.value) {
      addProp(el, 'textContent', `s(${dir.value})`);
    }
  },
  html: function html (el, dir) {
    if (dir.value) {
      addProp(el, 'innerHTML', `s(${dir.value})`);
    }
  }
}

export default {
  directives
};


