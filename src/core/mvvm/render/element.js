import {createElement as _createElement} from '../vdom'
export function createElement(tag, data, children, normalizationType){
	return _createElement(this.vm, tag, data, children, normalizationType, false)
}