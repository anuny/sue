const doc = document;
let fns = [], fn, f = false,
testEl = doc.documentElement,
hack = testEl.doScroll,
domContentLoaded = 'DOMContentLoaded',
addEventListener = 'addEventListener',
onreadystatechange = 'onreadystatechange',
readyState = 'readyState',
loadedRgx = hack ? /^loaded|^c/ : /^loaded|c/,
loaded = loadedRgx.test(doc[readyState]);

function flush(f) {
	loaded = 1;
	while (f = fns.shift()){
		f && 'function' === typeof(f) && f();
	}
}

doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
	doc.removeEventListener(domContentLoaded, fn, f)
	flush()
}, f)


hack && doc.attachEvent(onreadystatechange, fn = function () {
	if (/^c/.test(doc[readyState])) {
		doc.detachEvent(onreadystatechange, fn);
		flush();
	}
});

function Ready(fn) {
	if(loaded){
		fn()
	}else{
		fns.push(fn);
	}
}

function hackReady(fn) {
	if(self != top){
		if(loaded){
			fn()
		}else{
			fns.push(fn)
		}
	}else{
		try {
			testEl.doScroll('left')
		} catch (e) {
			return setTimeout(function(){domReady(fn)}, 50)
		}
		fn && fn()
	}
}


let domReady = hack ? hackReady : Ready;

	
export default function(callback){
	if(this.isReady){
		callback();
	}else{
		domReady(callback);
		this.isReady = true;
	}
	return this;
}
