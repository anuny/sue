import type from '@helper/type';

function Cookie(name, value, options) {
	if (type(value).isUndefined) {
		var expires=-1
		if(type(options).isNumber){
			expires = options;
		}else{
			options = options || {};
			expires = options.expires && (type(options.expires).isNumber || options.expires.toUTCString) ? options.expires : -1
		}
		if (value === null) value = '';
		var date = new Date();
		date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000))
		expires = '; expires=' + date.toUTCString()
		var path = options.path ? '; path=' + (options.path) : '';
		var domain = options.domain ? '; domain=' + (options.domain) : '';
		var secure = options.secure ? '; secure': '';
		document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('')
	} else {
		var cookieValue = null;
		if (document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = cookies[i].trim();
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break
				}
			}
		};
		return cookieValue
	}
};
export default Cookie
