export default function log(type,msg){
	if(!msg){
		msg = type
		type = 'log'
	}
	let fn = console[type]||console.log;
	fn(`Fui:${type}: ${msg}`)
}