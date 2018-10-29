function http(options) {
	if(!options.url)return;
	var xmlhttp=new XMLHttpRequest()||new ActiveXObject('Microsoft.XMLHTTP');
	var type=(options.type||'POST').toUpperCase();
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState == 4&&xmlhttp.status == 200&&!!options.success)
			options.success(xmlhttp.responseText);
		if(xmlhttp.readyState == 4&&xmlhttp.status != 200&&!!options.error)
			options.error();
	};
	if(type=='POST'){
		xmlhttp.open(type, options.url, options.async||true);
		xmlhttp.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		xmlhttp.send(_params(options.data||null));
	}
	else if(type=='GET'){
		xmlhttp.open(type, options.url+'?'+_params(options.data||null), options.async||true);
		xmlhttp.send(null);
	}
};
//_params函数解析发送的data数据，对其进行URL编码并返回
function _params(data,key) {
	var params = '';
	key=key||'';
	var type={'string':true,'number':true,'boolean':true};
	if(type[typeof(data)]){
		params = data;
	}else{
		for(var i in data) {
			if(type[typeof(data[i])]){
				params += "&" + key + (!key?i:('['+i+']')) + "=" +data[i];
			}else{
				params+=_params(data[i],key+(!key?i:('['+i+']')));
			}
		}
	}
	return !key?encodeURI(params).replace(/%5B/g,'[').replace(/%5D/g,']'):params;
};

export default http