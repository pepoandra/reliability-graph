class GraphEdge {
	/**
	 * @param {GraphVertex} startVertex
	 * @param {GraphVertex} endVertex
	 * @param {number} [weight=1]
	 */
	constructor(startVertex, endVertex, reliability = 1, cost = 0) {
		this.startVertex = startVertex;
		this.endVertex = endVertex;
		this.reliability = reliability;
		this.cost = cost;
	}

	/**
	 * @return {string}
	 */
	getKey() {
		const startVertexKey = this.startVertex.getKey();
		const endVertexKey = this.endVertex.getKey();

		return `${startVertexKey}_${endVertexKey}`;
	}

	/**
	 * @return {number}
	 */
	getCost() {
		return this.cost;
	}

	/**
	 * @return {number}
	 */
	getRel() {
		return this.reliability;
	}

	/**
	 * @return {GraphEdge}
	 */
	reverse() {
		const tmp = this.startVertex;
		this.startVertex = this.endVertex;
		this.endVertex = tmp;

		return this;
	}

	/**
	 * @return {string}
	 */
	toString() {
		return this.getKey();
	}
}
