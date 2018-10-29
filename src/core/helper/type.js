
function typeIs(obj){
	var tostring = Object.prototype.toString, regexp = /\[object\s|\]/g;
	return tostring.call(obj).replace(regexp, '');
}

function Type(obj){
	this.is = typeIs(obj);
	var types = ['Array','Boolean','Date','Error','Function','Number','Undefined','Null','Object','RegExp','String','Symbol']
	types.forEach( type=>{
		this.isPrimitive = (this.is === 'String' ||this.is === 'Number' || this.is === 'Symbol' ||this.is === 'Boolean');
		this['is' + type] = type === this.is;
	});
}

export default obj => new Type(obj) 