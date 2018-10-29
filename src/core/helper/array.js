
function array2Tree(array, pid){
	if (pid === undefined) pid = -1;
	var self = this;
	var tree = [];
	array.forEach(function(e,i) {
		if (e.pid && e.pid == pid) {
			e.children = array2Tree(array, e.id);
			tree.push(e)
		}
	})
	return tree
}

function tree2Array(array,pid){
	
}

export { array2Tree, tree2Array }