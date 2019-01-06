(function() {
	var margin = {top: 15, right: 15, bottom: 15, left: 15},
		width = 120,
		height = 120,
		r = 5;

	var vars = {health_expend_ntile: "Health expenditure", edu_expend_ntile: "Education expenditure",
				poli_stab_ntile: "Political stability", gov_effec_ntile: "Government effectiveness", reg_qual_ntile: "Regulatory quality",
				rule_law_ntile: "Rule of law", corrupt_ntile: "Control of corruption", jud_effec_ntile: "Judicial effectiveness",
				gov_integ_ntile: "Government integrity", prop_rights_ntile: "Property rights", ec_free_ntile: "Overall economic freedom",
				fin_free_ntile: "Financial freedom"};

	var length = d3.scaleLinear().domain([0, 100]).range([r, width/2 - margin["top"]]);
	var rotationDegree = d3.scalePoint().domain(Object.keys(vars)).range([0, 2*Math.PI - Math.PI/6]);
// console.log(rotationDegree.domain(), rotationDegree.range());
	var colorScale = d3.scaleOrdinal().domain([0, 1, 2]).range(["#d2d2d2", "#d2d2d2", "#ffe5cc"]);


	d3.csv("data/percentiles.csv", function(d) {
		return {
			country_name: d.country_name,
			top_country: d.top_country,
			metric: d.metric,
			percentile: +d.percentile
		};
	}, function(error, data) {
		if(error) throw error;

		data.sort(function(x, y) { return d3.ascending(x.country_name, y.country_name); });
		var nested_data = d3.nest().key(function(d) { return d.country_name; }).entries(data.filter(function(d) { return !isNaN(d.percentile); }));
		// console.log(nested_data);

		makeSuns(nested_data);
	});

	function makeSuns(data) {
		var svg = d3.select("#suns").selectAll("svg")
			.data(data)
			.enter()
			.append("svg")
			.attr("class", "countrySun")
			.attr("width", width)
			.attr("height", height)
			// .attr("transform", "rotate(-46)")
			.append("g")
			.attr("transform", "translate(0,0)");

		var rays = svg.selectAll(".ray")
			.data(function(d) { return d.values; })
			.enter()
			.append("line")
			.attr("class", "ray")
			.attr("x1", width / 2)
			.attr("y1", height / 2)
			.attr("x2", function(d) { return length(d.percentile) * Math.cos(rotationDegree(d.metric)) + (width/2); })
			.attr("y2", function(d) { return length(d.percentile) * Math.sin(rotationDegree(d.metric)) + (height/2); })
			.style("stroke", function(d) { return colorScale(d.top_country); });

		svg.append("circle")
			.attr("class", "sun center")
			.attr("cx", width / 2)
			.attr("cy", height / 2)
			.attr("r", r)
			.style("stroke", function(d) { return colorScale(d.values[0].top_country); });

		svg.append("text")
			.attr("class", "countryName")
			.attr("x", width / 2)
			.attr("y", 15)
			.attr("text-anchor", "middle")
			.attr("fill", "#000")
			.text(function(d) { return d.key; });
	}
})();


