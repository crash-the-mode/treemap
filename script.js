async function drawTreeMap() {

	// 1. Access data

	const movies = await d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json");
	console.log(movies);

	// 2. Create dimensions
	
	const width = 1440;
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

	const clips = treemap.append("defs")
		.selectAll("clipPath")
		.data(nodes.leaves())
		.enter()
		.append("clipPath")
		.attr("id", (d, i) => `clipPath-${i}`)
		.append("rect")
		.attr("width", d => d.x1 - d.x0)
		.attr("height", d => d.y1 - d.y0);

	const tileGroups = treemap.selectAll("g")
		.data(nodes.leaves())
		.enter()
		.append("g")
		.style("transform", d => `translate(${d.x0}px, ${d.y0}px)`)
		.attr("clip-path", (d, i) => `url(#clipPath-${i})`);

	const tiles = tileGroups.append("rect")
		.attr("width", d => d.x1 - d.x0)
		.attr("height", d => d.y1 - d.y0)
		.attr("fill", d => {
			while( d.depth > 1 )
				d = d.parent;
			return colorScale(d.data.name);
		})
		.attr("class", "tile")
		.attr("data-name", d => d.data.name)
		.attr("data-category", d => d.data.category)
		.attr("data-value", d => d.data.value);

	const tileText = tileGroups.append("text")
		.selectAll("tspan")
		.data(d => d.data.name.split(" "))
		.enter()
		.append("tspan")
		.attr("x", 5)
		.attr("y", (d, i) => i * 15 + 15)
		.text(d => d);

	// 6. Draw peripherals

	const title = canvas.append("text")
		.attr("id", "title")
		.text(movies.name)
		.attr("x", dimensions.width / 2)
		.attr("y", 50)
		.style("text-anchor", "middle");

	const description = canvas.append("text")
		.attr("id", "description")
		.text("Top 47 US Box Office Performers")
		.attr("x", dimensions.width / 2)
		.attr("y", 75)
		.style("text-anchor", "middle")
}

drawTreeMap();

