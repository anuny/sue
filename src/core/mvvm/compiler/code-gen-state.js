export default function CodegenState (options={}) {
  this.options = options;
  this.transforms = pluckModuleFunction(options.modules, 'transformCode');
  this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
  this.directives = options.directives;
  var isReservedTag = options.isReservedTag || function (a, b, c) { return false; };
  this.maybeComponent = function (el) {
  	return !isReservedTag(el.tag);
  };
  this.onceId = 0;
  this.staticRenderFns = [];
}

function pluckModuleFunction (modules,key) {
	let ret = []
	if(modules){
		ret = modules.map(function (m) { return m[key]; }).filter(function (_) { return _; })
	}
  return ret
}


