async function drawTreeMap() {

	// 1. Access data

	const movies = await d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json");
	console.log(movies);

	const nameAccessor = d => d.data.name;
	const catAccessor = d => d.data.category;
	const valAccessor = d => d.data.value;

	// 2. Create dimensions
	
	const width = 1750;
	const height = 850;
	dimensions = {
		width: width,
		height: height,
		margin: {
			top: 100,
			right: 150,
		},
	};
	dimensions.boundedWidth = width - dimensions.margin.right;
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
	d3.treemap().size([dimensions.boundedWidth, dimensions.boundedHeight]).padding(1)(nodes);
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
			return colorScale(nameAccessor(d));
		})
		.attr("class", "tile")
		.attr("data-name", d => nameAccessor(d))
		.attr("data-category", d => catAccessor(d))
		.attr("data-value", d => valAccessor(d));

	const tileText = tileGroups.append("text")
		.selectAll("tspan")
		.data(d => nameAccessor(d).split(" "))
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
		.text("Top 47 US Box Office Performers Grouped by Genre")
		.attr("x", dimensions.width / 2)
		.attr("y", 85)
		.style("text-anchor", "middle");

	const legendGroup = canvas.append("g")
		.attr("id", "legend")
		.style("transform", `translate(${dimensions.boundedWidth + 25}px, ${dimensions.boundedHeight / 2}px)`);

	console.log(nodes.children)
	const legendRects = legendGroup.selectAll(".legend-item")
		.data(nodes.children)
		.enter()
		.append("rect")
		.attr("class", "legend-item")
		.attr("x", 5)
		.attr("y", (d, i) => i * 30)
		.attr("width", 20)
		.attr("height", 20)
		.attr("fill", d => colorScale(nameAccessor(d)));

	const legendText = legendGroup.selectAll(".legend-text")
		.data(nodes.children)
		.enter()
		.append("text")
		.text(d => nameAccessor(d))
		.attr("x", 30)
		.attr("y", (d, i) => i * 30 + 15);

	// 7. Set up interactions

	tileGroups.on("mousemove", onMouseEnter).on("mouseleave", onMouseLeave);
	const tooltip = d3.select("#tooltip");

	function onMouseEnter(e, datum) {
//		console.log({e, datum});
//		console.log(d3.pointer(e));
		const mouseCoords = d3.pointer(e);
		let x = mouseCoords[0] + datum.x0;
		let y = mouseCoords[1] + dimensions.margin.top + datum.y0;

		tooltip.select("#movie")
			.text(`Movie: ${nameAccessor(datum)}`);
		tooltip.select("#category")
			.text(`Category: ${catAccessor(datum)}`);
		tooltip.select("#value")
			.text(`US Box Office: $${d3.format(",")(valAccessor(datum))}`);
		tooltip.attr("data-value", valAccessor(datum));
		tooltip.style("transform", `translate(calc(-10% + ${x}px), calc(-105% + ${y}px))`)
		tooltip.style("opacity", 1);
	}
	function onMouseLeave(e, datum) {
		tooltip.style("opacity", 0);
	}
}

drawTreeMap();

