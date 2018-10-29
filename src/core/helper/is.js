export default {
	url(uri){
		return new RegExp("^((.*\:)?//)").test(uri)
	},
	email(str){
		return /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+(\.[a-zA-Z]{2,3})+$/.test(str)
	},
	phone(str){
		return /^1[3458]\d{9}$/.test(str)
	},
	id(str){
		return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(str);
	},
	ip(str){
		return /^((([1-9]\d?)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}(([1-9]\d?)|(1\d{2})|(2[0-4]\d)|(25[0-5]))$/.test(str)
	},
	zh(str){
		return /^[\u4e00-\u9fa5]+$/.test(str)
	},
	en(str){
		return /^[A-Za-z]+$/.test(str)
	}
}