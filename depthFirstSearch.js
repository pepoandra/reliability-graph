var s = new Set();

/**
 * @typedef {Object} Callbacks
 *
 * @property {function(vertices: Object): boolean} [allowTraversal] -
 *  Determines whether DFS should traverse from the vertex to its neighbor
 *  (along the edge). By default prohibits visiting the same vertex again.
 *
 * @property {function(vertices: Object)} [enterVertex] - Called when DFS enters the vertex.
 *
 * @property {function(vertices: Object)} [leaveVertex] - Called when DFS leaves the vertex.
 */

/**
 * @param {Callbacks} [callbacks]
 * @returns {Callbacks}
 */
function initCallbacks(callbacks = {}) {
	const initiatedCallback = callbacks;

	const stubCallback = () => {};

	const allowTraversalCallback = (() => {
		const seen = {};
		return ({ nextVertex }) => {
			if (!seen[nextVertex.getKey()]) {
				seen[nextVertex.getKey()] = true;
				return true;
			}
			return false;
		};
	})();

	initiatedCallback.allowTraversal =
		callbacks.allowTraversal || allowTraversalCallback;
	initiatedCallback.enterVertex = callbacks.enterVertex || stubCallback;
	initiatedCallback.leaveVertex = callbacks.leaveVertex || stubCallback;

	return initiatedCallback;
}

/**
 * @param {GraphVertex} currentVertex
 * @param {GraphVertex} previousVertex
 * @param {Callbacks} callbacks
 */
function depthFirstSearchRecursive(
	graph,
	currentVertex,
	previousVertex,
	callbacks
) {
	callbacks.enterVertex({ currentVertex, previousVertex });

	s.add(currentVertex.getKey());

	graph.getNeighbors(currentVertex).forEach(nextVertex => {
		//console.log(currentVertex.getKey());
		if (
			callbacks.allowTraversal({ previousVertex, currentVertex, nextVertex })
		) {
			depthFirstSearchRecursive(graph, nextVertex, currentVertex, callbacks);
		}
	});

	callbacks.leaveVertex({ currentVertex, previousVertex });
	return currentVertex.getKey();
}

/**
 * @param {Graph} graph
 * @param {GraphVertex} startVertex
 * @param {Callbacks} [callbacks]
 */
function depthFirstSearch(graph, startVertex, callbacks) {
	const previousVertex = null;
	s.clear();
	depthFirstSearchRecursive(
		graph,
		startVertex,
		previousVertex,
		initCallbacks(callbacks)
	);
	var res = s.size - graph.getAllVertices().length === 0;
	//console.log(s);
	if (res) {
		// console.log(
		// 	"res: " +
		// 		res +
		// 		" set: " +
		// 		s.size +
		// 		" #edgs: " +
		// 		graph.getAllEdges().length
		// );
		// console.log(graph);
	}
	return res;
}
