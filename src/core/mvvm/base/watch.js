import Watcher  from '../watcher'
export function watch(variable, callback){
	new Watcher(this.vm, variable, callback)
}

