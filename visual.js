var n = 0;
var rel_list = [];
var cost_list = [];
var edges = [];
let total_rel = 1;
let total_cost = 0;
var g = new Graph();
var not_g = new Graph();

var min_rel = 0;
var max_cost = Number.MAX_SAFE_INTEGER;

$(document).ready(function() {
	//	populateSelects();
});

function populateSelects() {
	document.getElementById("edges_table").style.display = "block";

	const vs = g.getAllVertices();
	const to = document.getElementById("to");
	const from = document.getElementById("from");
	to.innerHTML = "";
	from.innerHTML = "";

	for (var i = 0; i < vs.length; i++) {
		addOption(to, vs[i].getKey());
		addOption(from, vs[i].getKey());
	}
	document.getElementById("edges_table").style.display = "block";
}

function addOption(e, o) {
	const option = document.createElement("option");
	option.text = o;
	e.add(option);
}

function addOneNode() {
	const v = new GraphVertex(g.getAllVertices().length);
	//	console.log(v);
	g.addVertex(v);
	printGraph(g);
}

function addOneEdge() {
	const to_select = document.getElementById("to");
	const from_select = document.getElementById("from");
	const to_value = to_select.options[to_select.selectedIndex].value;
	const from_value = from_select.options[from_select.selectedIndex].value;

	const rel = document.getElementById("edge_rel").value;
	const cos = document.getElementById("edge_cost").value;

	if (to_value == from_value) {
		return;
	}
	g.addEdge(
		new GraphEdge(
			g.getVertexByKey(to_value),
			g.getVertexByKey(from_value),
			rel,
			cos
		)
	);
	printGraph(g);
}

function updateMinRel(value) {
	min_rel = value;
}

function updateMaxCost(value) {
	max_cost = value;
}

function handleFiles(files) {
	var reader = new FileReader();
	reader.readAsText(files[0], "UTF-8");

	reader.onload = function(evt) {
		var content = evt.target.result.split("\n");
		info = [];
		for (var i = 0; i < content.length; i++) {
			if (content[i][0] == "#") {
				//		console.log("comment!");
			} else {
				info.push(content[i]);
			}
		}

		n = info[0];

		const costs = info[2].split(" ");
		const rels = info[1].split(" ");

		for (var i = 0; i < costs.length; i++) {
			cost_list.push(costs[i]);
			rel_list.push(rels[i]);
		}

		//	document.getElementById("addNode").disabled = false;
		//	document.getElementById("addEdge").disabled = false;
		document.getElementById("option_c").disabled = false;
		document.getElementById("option_a").disabled = false;
		document.getElementById("option_b").disabled = false;

		//calculate()
	};
}

function calculate(option) {
	g = new Graph();
	not_g = new Graph();

	const cost_graph = {};
	const rel_graph = {};
	const link_graph = {};
	edges = [];

	for (var i = 0; i < n; i++) {
		cost_graph[i] = {};
		rel_graph[i] = {};
		link_graph[i] = {};

		const v = new GraphVertex(i);
		g.addVertex(v);
		const not_v = new GraphVertex(i);
		not_g.addVertex(not_v);
	}

	let a = n;
	let c = 0;
	let d = 0;
	for (var i = 0; i < n - 1; i++) {
		a--;
		for (var j = c + 1; j < n; j++) {
			const out = `${c} ${j}`;

			cost_graph[c][j] = cost_list[d];
			cost_graph[j][c] = cost_list[d];

			link_graph[j][c] = 1;
			link_graph[c][j] = 1;

			rel_graph[c][j] = rel_list[d];
			rel_graph[j][c] = rel_list[d];

			const e = new GraphEdge(
				g.getVertexByKey(c),
				g.getVertexByKey(j),
				rel_list[d],
				cost_list[d]
			);

			not_g.addEdge(e);

			d++;
		}
		c++;
	}

	function range(start, end, step = 1) {
		const len = Math.floor((end - start) / step) + 1;
		return Array(len)
			.fill()
			.map((_, idx) => start + idx * step);
	}

	const unreached = range(0, n - 1);
	const reached = [];
	let from = -1;
	total_rel = 1;
	total_cost = 0;
	let index = unreached.indexOf(0);
	reached.push(0);
	if (index == !-1) unreached.splice(index, 1);

	while (unreached.length > 0) {
		// for (var boii = 0; boii < 5; boii++) {

		let min = Number.MAX_SAFE_INTEGER;
		let max = 0;
		let rel = 1;
		cost = 0;
		idx = -1;

		for (var i = 0; i < reached.length; i++) {
			for (var j = 0; j < unreached.length; j++) {
				// console.log(cost_graph[reached[i]][unreached[j]]);

				switch (option) {
					case "a":
						if (rel_graph[reached[i]][unreached[j]] > max) {
							max = rel_graph[reached[i]][unreached[j]];
							cost = cost_graph[reached[i]][unreached[j]];
							idx = unreached[j];
							from = reached[i];
						}
						break;

					case "b":
						if (cost_graph[reached[i]][unreached[j]] < min) {
							min = cost_graph[reached[i]][unreached[j]];
							rel = rel_graph[reached[i]][unreached[j]];
							idx = unreached[j];
							from = reached[i];
						}
						break;

					case "c":
						if (cost_graph[reached[i]][unreached[j]] < min) {
							min = cost_graph[reached[i]][unreached[j]];
							rel = rel_graph[reached[i]][unreached[j]];
							idx = unreached[j];
							from = reached[i];
						}
						break;
				}
			}
		}
		//	console.log(`Best cost: ${min} from vertex ${from} to vertex ${idx}`);
		edges.push([from, idx, cost_graph[from][idx], rel_graph[from][idx], 1]);

		not_g.deleteEdge(
			not_g.edges[from + "_" + idx] || not_g.edges[idx + "_" + from]
		);

		const e = new GraphEdge(
			g.getVertexByKey(from),
			g.getVertexByKey(idx),
			rel_graph[from][idx],
			cost_graph[from][idx]
		);

		g.addEdge(e);
		g.setRel(g.getRel() * rel_graph[from][idx]);
		//console.log(g.getRel());
		total_cost += min * 1;
		total_rel *= rel;
		//console.log(unreached);
		//console.log(reached);
		index = unreached.indexOf(idx);
		//	console.log(`obj found at index # ${index} of unreached`);
		if (!(index == -1)) {
			//	console.log(`removing ${idx}`);
			unreached.splice(index, 1);
			reached.push(idx);
		}
		//	console.log("\n\n");
	}

	//console.log(unreached);
	///	console.log(reached);
	//	console.log(cost_graph);
	//	console.log(`Total cost: ${total_cost}\nReliability: ${total_rel}`);
	const pq = new PriorityQueue();
	var unused_edges = not_g.getAllEdges();
	var print = true;
	switch (option) {
		case "a":
			var unused_edges = not_g.getAllEdges();
			for (var i = 0; i < unused_edges.length; i++) {
				pq.add(unused_edges[i], 1 - unused_edges[i].getRel());
			}

			while (min_rel > g.getReliability()) {
				if (pq.isEmpty()) {
					console.log("No results satisfy these constraints.");
					alert("No results satisfy these constraints.");
					print = false;
					break;
				}
				//	console.log(pq);

				const edge = pq.poll();
				not_g.deleteEdge(edge);
				//	console.log(edge);

				g.addEdge(
					new GraphEdge(
						g.getVertexByKey(edge.startVertex),
						g.getVertexByKey(edge.endVertex),
						edge.getRel(),
						edge.getCost()
					)
				);
			}

			break;

		case "b":
			if (max_cost < g.getCost()) {
				console.log("No results satisfy these constraints.");
				alert("No results satisfy these constraints.");
				print = false;
				break;
			}
			for (var i = 0; i < unused_edges.length; i++) {
				pq.add(unused_edges[i], 1 - unused_edges[i].getRel());
			}
			while (min_rel > g.getReliability()) {
				//console.log(pq);

				const edge = pq.poll();
				//	console.log(edge);reliability
				not_g.deleteEdge(edge);
				//	console.log(edge);

				if (pq.isEmpty()) {
					console.log("No results satisfy these constraints.");
					alert("No results satisfy these constraints.");
					print = false;
					break;
				}
				//	console.log(Number(edge.getCost()) + Number(g.getCost()));
				//	console.log(max_cost);
				if (Number(edge.getCost()) + Number(g.getCost()) > max_cost) {
					continue;
				}
				g.addEdge(
					new GraphEdge(
						g.getVertexByKey(edge.startVertex),
						g.getVertexByKey(edge.endVertex),
						edge.getRel(),
						edge.getCost()
					)
				);
			}

			break;

		case "c":
			if (max_cost < g.getCost()) {
				console.log("No results satisfy these constraints.");
				alert("No results satisfy these constraints.");
				print = false;
				break;
			}
			for (var i = 0; i < unused_edges.length; i++) {
				pq.add(unused_edges[i], 1 - unused_edges[i].getRel());
			}
			while (max_cost > g.getCost()) {
				//console.log(pq);

				const edge = pq.poll();
				//	console.log(edge);reliability
				not_g.deleteEdge(edge);
				//	console.log(edge);

				//console.log(Number(edge.getCost()) + Number(g.getCost()));
				//	console.log(max_cost);
				if (Number(edge.getCost()) + Number(g.getCost()) > max_cost) {
					consolelog(edge);
					continue;
				}
				g.addEdge(
					new GraphEdge(
						g.getVertexByKey(edge.startVertex),
						g.getVertexByKey(edge.endVertex),
						edge.getRel(),
						edge.getCost()
					)
				);

				if (pq.isEmpty()) {
					break;
				}
			}
			break;
	}
	if (print) {
		printGraph(g);
	}
}

function printGraph(g) {
	d3.select("svg").remove();

	var createNodes = function(numNodes, radius) {
		var nodes = [],
			width = radius * 2 + 50,
			height = radius * 2 + 50,
			angle,
			x,
			y,
			i;
		for (i = 0; i < numNodes; i++) {
			angle = (i / (numNodes / 2)) * Math.PI; // Calculate the angle at which the element will be placed.
			// For a semicircle, we would use (i / numNodes) * Math.PI.
			x = radius * Math.cos(angle) + width / 2; // Calculate the x position of the element.
			y = radius * Math.sin(angle) + width / 2; // Calculate the y position of the element.
			nodes.push({ id: i, x: x, y: y });
		}
		return nodes;
	};

	var width;
	var height;

	var createSvg = function(radius, callback) {
		d3.selectAll("svg").remove();

		width = radius * 2 + 50;

		height = width + 100;
		var svg = d3
			.select("#canvas")
			.append("svg:svg")
			.attr("width", width)
			.attr("height", height);
		callback(svg);
	};

	var createElements = function(svg, nodes, elementRadius, links) {
		for (var i = 0; i < links.length; i++) {
			var deltaX = links[i].target.x - links[i].source.x,
				deltaY = links[i].target.y - links[i].source.y,
				dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
				normX = deltaX / dist,
				normY = deltaY / dist,
				/*
      sourcePadding = links[i].left ? 17 : 12,
      targetPadding = links[i].right ? 17 : 12,
      */
				sourcePadding = 12;
			targetPadding = 12;
			(sourceX = links[i].source.x + sourcePadding * normX),
				(sourceY = links[i].source.y + sourcePadding * normY),
				(targetX = links[i].target.x - targetPadding * normX),
				(targetY = links[i].target.y - targetPadding * normY);

			var line = svg
				.append("line")
				.attr("x1", sourceX)
				.attr("y1", sourceY)
				.attr("x2", targetX)
				.attr("y2", targetY)
				.attr("stroke-width", 2)
				.attr("stroke", "black");

			const padx = 15;
			const pady = 16;
			const x = (links[i].source.x + links[i].target.x) / 2;
			const y = (links[i].source.y + links[i].target.y) / 2;

			element = svg
				.append("svg:rect")
				.attr("x", x - padx - 5)
				.attr("y", y - pady)
				.attr("width", 65)
				.attr("height", 39);
			//.style('fill', 'white')

			element = svg
				.append("svg:text")
				.attr("x", x - padx)
				.attr("y", y + pady)
				.style("font-size", "15px")
				.style("fill", "lime")
				.attr("class", "rel")
				.text("rel: " + Math.floor(links[i].rel * 100) / 100);

			element = svg
				.append("svg:text")
				.attr("x", x - padx)
				.attr("y", y)
				.style("font-size", "15px")
				.style("fill", "red")
				.attr("class", "cost")
				.text("cost: " + links[i].cost);
		}
		element = svg
			.selectAll("circle")
			.data(nodes)
			.enter()
			.append("svg:circle")
			.attr("r", elementRadius)
			.attr("cx", function(d, i) {
				return d.x;
			})
			.attr("cy", function(d, i) {
				return d.y;
			});

		for (var i = 0; i < nodes.length; i++) {
			element = svg
				.append("svg:text")
				.attr("x", nodes[i].x - 3)
				.attr("y", nodes[i].y + 5)
				.style("font-size", "15px")
				.style("font-weight", "bold")
				//.attr('y', function (d) { return 4; })
				.attr("class", "id")
				.text(nodes[i].id);
		}
	};

	var finalText = function(svg) {
		element = svg
			.append("svg:text")
			.attr("x", 20)
			.attr("y", height - 50)
			.style("font-size", "20px")
			.style("fill", "red")
			.attr("class", "cost")
			.text("Total cost: " + g.getCost());

		document.getElementById("cost_out").innerText = g.getCost();

		element = svg
			.append("svg:text")
			.attr("x", 20)
			.attr("y", height - 25)
			.style("font-size", "20px")
			.style("fill", "green")
			.attr("class", "rel")
			.text("Total reliability: " + g.getReliability().toFixed(7));
		document.getElementById("rel_out").innerText = g
			.getReliability()
			.toFixed(7);
	};

	var draw = function() {
		var numNodes = g.getAllVertices().length;

		var radius = 220;
		links = [];

		var nodes = createNodes(numNodes, radius);

		const e = g.getAllEdges();

		for (var i = 0; i < e.length; i++) {
			links.push({
				source: nodes[e[i].getKey().split("_")[0]],
				target: nodes[e[i].getKey().split("_")[1]],
				cost: e[i].getCost(),
				rel: e[i].getRel()
			});
		}

		// for (var i = 0; i < edges.length; i++) {
		// 	links.push({
		// 		source: nodes[edges[i][0]],
		// 		target: nodes[edges[i][1]],
		// 		cost: edges[i][2],
		// 		rel: parseFloat(edges[i][3])
		// 	});
		// }

		createSvg(radius, function(svg) {
			createElements(svg, nodes, 20, links);
			finalText(svg);
		});
	};

	//$(document).ready(function() {
	//    draw();
	//});

	draw();
	populateSelects();
	document.getElementById("addEdge").disabled = false;
	document.getElementById("addNode").disabled = false;
}
var links;
