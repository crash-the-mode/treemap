async function drawTreeMap() {

	// 1. Access data

	const movies = await d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json");
	console.log(movies);

	// 2. Create dimensions
	
	const width = 1500;
	const height = 850;
	dimensions = {
		width: width,
		height: height,
		margin: {
			top: 100,
		},
	};
	dimensions.boundedHeight = height - dimensions.margin.top;

	// 3. Draw canvas
	
	const canvas = d3.select("#wrapper")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	const treemap = canvas.append("g")
		.style("transform", `translateY(${dimensions.margin.top}px)`);

	// 4. Create scales
	
	const colorLength = movies.children.length;
	console.log(colorLength, typeof colorLength);

	const colorScale = d3.scaleOrdinal(d3.schemeDark2);

	// 5. Draw data
	
	const nodes = d3.hierarchy(movies).sum(d => d.value).sort((a, b) => b.value - a.value);
	d3.treemap().size([width, dimensions.boundedHeight]).padding(1)(nodes);
	console.log(nodes);

	treemap.selectAll(".tile")
		.data(nodes.leaves())
		.enter()
		.append("rect")
		.attr("class", "tile")
		.attr("x", d => d.x0)
		.attr("y", d => d.y0)
		.attr("width", d => d.x1 - d.x0)
		.attr("height", d => d.y1 - d.y0)
		.attr("fill", d => {
			while (d.depth > 1)
				d = d.parent;
			return colorScale(d.data.name);
		});

	treemap.selectAll("text")
		.data(nodes.leaves())
		.enter()
		.append("text")
		.attr("x", d => d.x0 + 5)
		.attr("y", d => d.y0 + 5)
		.text(d => d.data.name)
}

drawTreeMap();

