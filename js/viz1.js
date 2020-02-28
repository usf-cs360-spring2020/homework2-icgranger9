let translate = function(x, y) {
	return 'translate(' + x + ',' + y + ')';
}

let createParallelCoords = function(file){

	// Selects only the relevant fields to save
	d3.csv(file, function(d) {
		return {
			"par_rank": +d["par_rank"],
			"par_mean": +d["par_mean"],
			"tier": +d["tier"],
			"k_mean": +d["k_mean"],
			"k_rank": +d["k_rank"],

			"tier_name": d["tier_name"], // Not sure we need it, but leaving for now
		};

	}).then(function(data) {

		console.log(data);
		drawEverything(data);
	});
}


let drawEverything = function(data) {

	// First, let's create some constants for use latter 
	
	const fields = Object.keys(data[0]).filter( item => item != "tier_name");

	const tiers = ["Ivy Plus", "Other elite schools (public and private)", "Highly selective public", 
	"Highly selective private", "Selective public", "Selective private", "Nonselective 4-year public", 
	"Nonselective 4-year private not-for-profit", "Two-year (public and private not-for-profit)", 
	"Four-year for-profit", "Two-year for-profit", "Less than two year schools of any type",
	 "Attending college with insufficient data", "Not in college between the ages of 19-22"]

	 const width = 960;
	const height = 500;

	const margin = {
		top:	30,
		right:	35, 
		bottom: 60, // leave space for x-axis
		left:	75	// leave space for y-axis
	};
	
	const svg = d3.select("body").select("svg#viz")
		.attr("width", width)
		.attr("height", height);

	console.assert(svg.size() == 1);


	// Now, let's call the key functions that actually do everything 
	drawLines(data);
	drawAxes();
	drawLegend();

	// Finally, we need to actually implement those functions
	function drawLines (data) {
		console.log("In draw lines")

		let yAxis = {} // What's a better name than y?
		for (curr_filed of fields) {
			let curr_min = d3.min(data, d => d[curr_filed])
			let curr_max = d3.max(data, d => d[curr_filed])

			yAxis[curr_filed] = d3.scaleLinear()
				.domain([curr_min, curr_max])
				.range([height, 0])

			console.log(curr_filed);
		}

		console.log("width: ", width)

		let xAxis = d3.scalePoint()
			.range([0, width]) // This is throwing off the width for some reason, not sure why
			.padding(.5)
			.domain(fields);

		// Note :Might need plot later. Should probably make it a constant
		let plot = svg.append("g").attr("id", "plot");
		// plot.attr("transform", translate(margin.left, margin.top));

		let lines = plot.selectAll("line")
			.data(data);

		lines.enter().append("path")
			.attr("d",  function(d) {
				return d3.line()(fields.map(function(p) {
				return [xAxis(p), yAxis[p](d[p])];
			}))})
			.style("fill", "none")
			.style("stroke", "#5F42D6") // Need to add color
			.style("opacity", 0.25);

		debugger;
	}

	function drawAxes() {
		console.log("In draw axes")

	}

	function drawLegend () {
		console.log("In draw legend")
	}
};


