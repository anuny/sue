export default function(){
	return '0101100101011010'.replace(/[01]/g, function(c) {
		var r = Math.random() * 16 | 0,v = c == '0' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}