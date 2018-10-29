var userAgent = navigator.userAgent.toLowerCase(),
	version = (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
	isChrome = /chrome/.test( userAgent ),
	isSafari = /apple/.test( userAgent ) && !isChrome,
	isFirefox = /firefox/.test( userAgent ),
	isOpera = /opera/.test( userAgent ),
	isMsie = /msie/.test( userAgent ) && /compatible/.test( userAgent ) && !isOpera,
	isEdge = /trident/.test( userAgent ) && !isMsie;
export default {
	userAgent,
	version,
	isSafari,
	isOpera,
	isMsie,
	isEdge,
	isChrome,
	language:navigator.language
}