let createParallelCoords = function(file){

	// Selects only the relevant fields to save
	d3.csv(file, function(d) {
		let res = {
			"par_rank": +d["par_rank"],
			"par_median": +d["par_median"],
			"ch_median": +d["k_median"],
			"ch_rank": +d["k_rank"],
		};

		// Groups tiers, for color scale
		res["tier_group"] = group_tier(d["tier_name"])

		return res

	}).then(function(data) {

		console.log(data);
		drawEverything(data);
	});
}


let drawEverything = function(data) {

	// First, let's create some constants for use latter 
	
	const fields = Object.keys(data[0]).filter( item => item != "tier_group");

	const tiers = ["Other", "Two Year or Less", "For Profit", "Non-selective", "Selective", "Highly Selective", "Elite"];

	const width = 1140; // ~960 for viz, ~130 for legend 
	const height = 500;

	const margin = {
		top:	30,
		right:	220, // ~130 for legend, plus a gap between the two
		bottom: 20,
		left:	40
	};

	const plotWidth = width - margin.right - margin.left;
	const plotHeight = height - margin.top - margin.bottom;


	const svg = d3.select("body").select("svg#viz")
		.attr("width", width)
		.attr("height", height);

	console.assert(svg.size() == 1);

	const plot = svg.append("g").attr("id", "plot")
		.attr("transform", translate(margin.left, margin.top));

	// Axes can't be in a specific function, because they're used by all / multiple.

	// Need a different scale for each field
	const yAxis = {}
		for (curr_filed of fields) {
			let curr_min = d3.min(data, d => d[curr_filed])
			let curr_max = d3.max(data, d => d[curr_filed])

			yAxis[curr_filed] = d3.scaleLinear()
				.domain([curr_min, curr_max])
				.range([plotHeight, 0])

		}

	// Only need one x-axis
	const xAxis = d3.scalePoint()
		.range([0, plotWidth])
		.domain(fields);

	// Needs a better Name
	const colorScale = d3.scaleOrdinal()
		.range(d3.schemeYlGnBu[7])
		.domain(tiers);

	// Now, let's call the key functions that actually do everything 
	drawLines(data);
	drawAxes();
	drawLegend();

	// Finally, we need to actually implement those functions
	function drawLines (data) {
		console.log("In draw lines")


		let lines = plot.selectAll("line")
			.data(data);

		lines.enter().append("path")
			.attr("class","single-line")
			.attr("d",  function(d) {
				return d3.line()(fields.map(function(p) {
				return [xAxis(p), yAxis[p](d[p])];
			}))})
			.style("stroke", d => colorScale(d.tier_group));

	}

	function drawAxes() {
		console.log("In draw axes")

		let axes = plot.selectAll("x-axis")
			.data(fields);

		axes.enter().append("g")
			.attr("transform",  d=> translate(xAxis(d), 0))
			.each(function(d) {
				d3.select(this).call(d3.axisLeft().scale(yAxis[d]));
			});


		axes.enter().append("text")
			.attr("class","axis-title")
			.attr("transform",  d=> translate(xAxis(d), -10))
			.attr("y", -1)
			.text(d => d);

	}

	function drawLegend () {
		console.log("In draw legend")

		// Needed to position the legend
		let legendX = width - margin.right + 60

		// Must make a scale, of the distance between each legend item
		const legendScale = d3.scalePoint()
			.range([plotHeight/3, 0])
			.domain(tiers);

		let legend = svg.append("g").attr("id", "legend")
			.attr("transform", translate(legendX, 20));


		// legend title
		legend.append("text")
			.attr("class","legend-title")
			.text("College Tier");

		let legendItem = legend.selectAll("x-axis")
			.data(tiers);


		// Add A colored rect for each item
		legendItem.enter().append("rect")
			.attr("class", "legend-squares")
			.attr("transform", d=> translate(0, legendScale(d)+8))
			.attr("width", 15)
			.attr("height", 15)
			.attr("fill", d => colorScale(d))

		// Label each item in the legend
		legendItem.enter().append("text")
			.attr("class", "legend-labels")
			.attr("transform", d=> translate(25, legendScale(d)+20))
			.text(d => d);
	}
};


//Helper functions, to make life easier
let translate = function(x, y) {
	return 'translate(' + x + ',' + y + ')';
}

let group_tier = function(tier_name) {
	let res = ""

	switch(tier_name) {

		case "Ivy Plus":
		case "Other elite schools (public and private)":
			res = "Elite";
			break;

		case "Highly selective public":
		case "Highly selective private":
			res = "Highly Selective";
			break;

		case "Selective public":
		case "Selective private":
			res = "Selective"
			break;

		case "Nonselective four-year public":
		case "Nonselective four-year private not-for-profit":
			res = "Non-selective";
			break;

		case "Four-year for-profit":
		case "Two-year for-profit":
			res = "For Profit";
			break;

		case "Two-year (public and private not-for-profit)":
		case "Less than two-year schools of any type":
			res = "Two Year or Less";
			break;

		case "Attending college with insufficient data":
		case "Not in college between the ages of 19-22":
			res = "Other"; // Should probably have a better name for this
			break;

		default:
			console.log(`Got invalid tier name, something is very wrong: "${tier_name}" `)
	}

	return res;
}




