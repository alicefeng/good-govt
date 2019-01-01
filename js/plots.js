var margin = {top: 20, right: 20, bottom: 20, left: 40},
	width = 500,
	height = 500;

var edScale = d3.scaleLinear().range([0, width]);
var healthScale = d3.scaleLinear().range([height, 0]);

var beeMargin = {top: 20, right: 75, bottom: 20, left: 75},
	beeWidth = 700,
	beeHeight = 500;

var systemMetricsScale = d3.scalePoint()
	.domain(["Political stability", "Government effectiveness", "Regulatory quality", "Rule of law", "Control of corruption"])//, "judicial_effectiveness_score", "government_integrity_score", "property_rights_score", "overall_economic_freedom_score", "financial_freedom_score"])
	.range([0, beeWidth]);
var wbScale = d3.scaleLinear().domain([-3, 2.5]).range([height, 0]);

var colorScale = d3.scaleOrdinal().domain([0, 1, 2]).range(["#d2d2d2", "#d2d2d2", "#ffe5cc"]);

d3.csv("data/data.csv", function(d) {
	return {
		country_name: d.country_name,
		top_country: d.top_country,
		population: +d.population,
		health_expenditure_per_person: +d.health_expenditure_per_person,
		edu_expenditure_per_person: +d.edu_expenditure_per_person,
		political_stability: +d.political_stability,
		gov_effectiveness: +d.gov_effectiveness,
		regulatory_quality: +d.regulatory_quality,
		rule_of_law: +d.rule_of_law,
		control_corruption: +d.control_corruption,
		judicial_effectiveness_score: +d.judicial_effectiveness_score,
		government_integrity_score: +d.government_integrity_score,
		property_rights_score: +d.property_rights_score,
		overall_economic_freedom_score: +d.overall_economic_freedom_score,
		financial_freedom_score: +d.financial_freedom_score
	};
}, function(error, data) {
	if(error) throw error;

	// console.log(data);
	edScale.domain([0, d3.max(data, function(d) { return d.edu_expenditure_per_person; })]).nice();
	healthScale.domain([0, d3.max(data, function(d) { return d.health_expenditure_per_person; })]).nice();
	makeScatterPlot(data);
	makeBeeswarm(data);
});

function makeScatterPlot(data) {
	var svg = d3.select("#health_ed_plot")
		.append("svg")
		.attr("width", width + margin["left"] + margin["right"])
		.attr("height", height + margin["top"] + margin["bottom"])
		// .attr("transform-origin", "top left")
		.attr("transform", "rotate(-45)")
		.append("g")
		.attr("transform", "translate(" + margin["left"] + "," + margin["top"] + ")");

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(edScale))
		.append("text")
		.attr("x", width)
		.attr("y", -5)
		.style("fill", "#000")
		.attr("text-anchor", "end")
		.text("Education expenditure per person (USD per capita)");

	svg.append("g")
		.attr("class", "y axis")
		.call(d3.axisLeft(healthScale))
		.append("text")
		.attr("x", 4)
		.attr("y", -5)
		.attr("transform", "rotate(90)")
		.attr("text-anchor", "start")
		.attr("fill", "#000")
		.text("Health expenditure per person (current international $)");


	var countries = svg.selectAll(".country")
		.data(data.filter(function(d) { return !isNaN(d.edu_expenditure_per_person) && !isNaN(d.health_expenditure_per_person); }))
		.enter()
		.append("circle")
		.attr("class", "country")
		.attr("r", 5)
		.attr("cx", function(d) { return edScale(d.edu_expenditure_per_person); })
		.attr("cy", function(d) { return healthScale(d.health_expenditure_per_person); })
		.style("fill", function(d) { return colorScale(d.top_country); });
}

function makeBeeswarm(data) {
	var wbData = [];
	data.forEach(function(d) {
		(!isNaN(d.political_stability)) && wbData.push({'country_name': d.country_name, 'metric': 'Political stability', 'score': d.political_stability, 'top_country': d.top_country});
		(!isNaN(d.gov_effectiveness)) && wbData.push({'country_name': d.country_name, 'metric': 'Government effectiveness', 'score': d.gov_effectiveness, 'top_country': d.top_country});
		(!isNaN(d.regulatory_quality)) && wbData.push({'country_name': d.country_name, 'metric': 'Regulatory quality', 'score': d.regulatory_quality, 'top_country': d.top_country});
		(!isNaN(d.rule_of_law)) && wbData.push({'country_name': d.country_name, 'metric': 'Rule of law', 'score': d.rule_of_law, 'top_country': d.top_country});
		(!isNaN(d.control_corruption)) && wbData.push({'country_name': d.country_name, 'metric': 'Control of corruption', 'score': d.control_corruption, 'top_country': d.top_country});
	});
	// console.log(wbData);

	var svg = d3.select("#stable_system")
		.append("svg")
		.attr("width", beeWidth + beeMargin["left"] + beeMargin["right"])
		.attr("height", beeHeight + beeMargin["top"] + beeMargin["bottom"])
		.append("g")
		.attr("transform", "translate(" + beeMargin["left"] + "," + beeMargin["top"] + ")");

	var labels = svg.selectAll(".metricLabel")
		.data(systemMetricsScale.domain())
		.enter()
		.append("text")
		.attr("class", "metricLabel")
		.attr("x", function(d) { return systemMetricsScale(d); })
		.attr("y", -5)
		.style("fill", "#000")
		.attr("text-anchor", "middle")
		.text(function(d) { return d; });

	svg.append("text")
		.attr("class", "metricLabel")
		.attr("x", -beeMargin["left"])
		.attr("y", 40)
		.attr("fill", "#000")
		.text("Better");

	svg.append("text")
		.attr("class", "metricLabel")
		.attr("x", -beeMargin["left"])
		.attr("y", height - 10)
		.attr("fill", "#000")
		.text("Worse");

	var simulation = d3.forceSimulation(wbData)
		.force("x", d3.forceX(function(d) { return systemMetricsScale(d.metric); }))
		.force("y", d3.forceY(function(d) { return wbScale(d.score); }).strength(1))
		.force("collide", d3.forceCollide(4))
		.stop();

	for(var i = 0; i < data.length; ++i) simulation.tick();

	var countries = svg.selectAll(".country")
		.data(wbData)
		.enter()
		.append("circle")
		.attr("class", "country")
		.attr("r", 4)
		.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; })
		.style("fill", function(d) { return colorScale(d.top_country); });
}