class Graph {
	/**
	 * @param {boolean} isDirected
	 */
	constructor(isDirected = false) {
		this.vertices = {};
		this.edges = {};
		this.isDirected = isDirected;
		this.cost = 0;
		this.allRel = 1;
	}

	getRel() {
		return this.allRel;
	}

	setRel(rel) {
		this.allRel = rel;
	}

	/**
	 * @param {GraphVertex} newVertex
	 * @returns {Graph}
	 */
	addVertex(newVertex) {
		this.vertices[newVertex.getKey()] = newVertex;

		return this;
	}

	/**
	 * @param {string} vertexKey
	 * @returns GraphVertex
	 */
	getVertexByKey(vertexKey) {
		return this.vertices[vertexKey];
	}

	/**
	 * @param {GraphVertex} vertex
	 * @returns {GraphVertex[]}
	 */
	getNeighbors(vertex) {
		return vertex.getNeighbors();
	}

	/**
	 * @return {GraphVertex[]}
	 */
	getAllVertices() {
		return Object.values(this.vertices);
	}

	/**
	 * @return {GraphEdge[]}
	 */
	getAllEdges() {
		return Object.values(this.edges);
	}

	/**
	 * @param {GraphEdge} edge
	 * @returns {Graph}
	 */
	addEdge(edge) {
		// Try to find and end start vertices.
		let startVertex = this.getVertexByKey(edge.startVertex.getKey());
		let endVertex = this.getVertexByKey(edge.endVertex.getKey());

		// Insert start vertex if it wasn't inserted.
		if (!startVertex) {
			this.addVertex(edge.startVertex);
			startVertex = this.getVertexByKey(edge.startVertex.getKey());
		}

		// Insert end vertex if it wasn't inserted.
		if (!endVertex) {
			this.addVertex(edge.endVertex);
			endVertex = this.getVertexByKey(edge.endVertex.getKey());
		}

		// Check if edge has been already added.
		if (this.edges[edge.getKey()]) {
			throw new Error("Edge has already been added before");
		} else {
			this.edges[edge.getKey()] = edge;
		}

		// Add edge to the vertices.
		if (this.isDirected) {
			// If graph IS directed then add the edge only to start vertex.
			startVertex.addEdge(edge);
		} else {
			// If graph ISN'T directed then add the edge to both vertices.
			startVertex.addEdge(edge);
			endVertex.addEdge(edge);
		}

		return this;
	}

	/**
	 * @param {GraphEdge} edge
	 */
	deleteEdge(edge) {
		// Delete edge from the list of edges.
		if (this.edges[edge.getKey()]) {
			delete this.edges[edge.getKey()];
		} else {
			throw new Error("Edge not found in graph");
		}

		// Try to find and end start vertices and delete edge from them.
		const startVertex = this.getVertexByKey(edge.startVertex.getKey());
		const endVertex = this.getVertexByKey(edge.endVertex.getKey());

		startVertex.deleteEdge(edge);
		endVertex.deleteEdge(edge);
	}

	/**
	 * @param {GraphVertex} startVertex
	 * @param {GraphVertex} endVertex
	 * @return {(GraphEdge|null)}
	 */
	findEdge(startVertex, endVertex) {
		const vertex = this.getVertexByKey(startVertex.getKey());

		if (!vertex) {
			return null;
		}

		return vertex.findEdge(endVertex);
	}

	/**
	 * @return {number}
	 */
	getCost() {
		return this.getAllEdges().reduce((cost, graphEdge) => {
			return cost + graphEdge.cost * 1;
		}, 0);
	}

	Cyclic() {
		const n = this.getAllVertices().length;
		const e = this.getAllEdges().length;
		console.log(n);
		return n - e < 1.0;
	}

	/**
	 * Reverse all the edges in directed graph.
	 * @return {Graph}
	 */
	reverse() {
		/** @param {GraphEdge} edge */
		this.getAllEdges().forEach(edge => {
			// Delete straight edge from graph and from vertices.
			this.deleteEdge(edge);

			// Reverse the edge.
			edge.reverse();

			// Add reversed edge back to the graph and its vertices.
			this.addEdge(edge);
		});

		return this;
	}

	/**
	 * @return {object}
	 */
	getVerticesIndices() {
		const verticesIndices = {};
		this.getAllVertices().forEach((vertex, index) => {
			verticesIndices[vertex.getKey()] = index;
		});

		return verticesIndices;
	}

	/**
	 * @return {*[][]}
	 */
	getAdjacencyMatrix() {
		const vertices = this.getAllVertices();
		const verticesIndices = this.getVerticesIndices();

		// Init matrix with infinities meaning that there is no ways of
		// getting from one vertex to another yet.
		const adjacencyMatrix = Array(vertices.length)
			.fill(null)
			.map(() => {
				return Array(vertices.length).fill(Infinity);
			});

		// Fill the columns.
		vertices.forEach((vertex, vertexIndex) => {
			vertex.getNeighbors().forEach(neighbor => {
				const neighborIndex = verticesIndices[neighbor.getKey()];
				adjacencyMatrix[vertexIndex][neighborIndex] = this.findEdge(
					vertex,
					neighbor
				).weight;
			});
		});

		return adjacencyMatrix;
	}

	isConnected() {
		const vert = this.getAllVertices();
		const edgs = this.getAllEdges();

		if (vert.length - 1 > edgs.length) {
			//	console.log("not enough edges");
			return false;
		}

		for (var i = 0; i < vert.length; i++) {
			if (vert[i].getDegree() === 0) {
				//	console.log("not all degree > 0");
				return false;
			}
		}

		const scc = stronglyConnectedComponents(this);
		//console.log(scc.length);
		//console.log(scc);

		return vert.length == scc[0].length;
	}

	getReliability() {
		const len = this.getAllEdges().length;
		const es = this.getAllEdges();
		var rel = 0;
		for (var i = 1; i < Math.pow(2, len); i++) {
			const new_g = new Graph();
			var prob = 1;
			const vertices = this.getAllVertices();
			for (var v = 0; v < vertices.length; v++) {
				new_g.addVertex(new GraphVertex(vertices[v].getKey()));
			}

			var bin = i.toString(2).split("");
			while (bin.length < 5) {
				bin.unshift("0");
			}

			//console.log(bin);

			for (var k = 0; k < len; k++) {
				//	console.log(k + "   " + Math.pow(2, k + 1));
				if (bin[k] == "1") {
					//console.log("adding edge " + k);

					new_g.addEdge(
						new GraphEdge(
							new_g.getVertexByKey(es[k].startVertex.getKey()),
							new_g.getVertexByKey(es[k].endVertex.getKey()),
							es[k].reliability,
							es[k].cost
						)
					);

					prob *= this.getAllEdges()[k].getRel();
				} else {
					prob *= 1 - this.getAllEdges()[k].getRel();
				}
			}

			if (i === 31) {
				console.log(new_g.getAllEdges());
				qcsho = new_g;
				console.log(new_g.isConnected());
			}
			if (new_g.isConnected()) {
				//console.log(g);
				rel += prob;

				console.log(prob + " " + rel);
			}
		}

		return rel;
	}

	/**
	 * @return {string}
	 */
	toString() {
		return Object.keys(this.vertices).toString();
	}
}

var qcsho;
