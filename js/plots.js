var COMMAFMT = d3.format(",.0f");

var margin = {top: 50, right: 20, bottom: 20, left: 40},
	width = 450,
	height = 450;

var edScale = d3.scaleLinear().range([0, width]);
var healthScale = d3.scaleLinear().range([height, 0]);

var beeMargin = {top: 20, right: 55, bottom: 20, left: 120},
	beeWidth = 700,
	beeHeight = 450;

var systemMetricsScale = d3.scalePoint()
	.range([0, beeWidth]);
var wbScale = d3.scaleLinear().domain([-3, 2.5]).range([beeHeight, 0]);
var heritageScale = d3.scaleLinear().domain([0, 100]).range([beeHeight, 0]);

var colorScale = d3.scaleOrdinal().domain([0, 1, 2]).range(["#d2d2d2", "#d2d2d2", "#ffe5cc"]);

var wbVars = ["Political stability", "Government effectiveness", "Regulatory quality", "Rule of law", "Control of corruption"];
var heritageVars = ["Judicial effectiveness", "Government integrity", "Property rights", "Overall economic freedom", "Financial freedom"];

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
	var metricsData = [];
	data.forEach(function(d) {
		(!isNaN(d.political_stability)) && metricsData.push({'country_name': d.country_name, 'metric': 'Political stability', 'score': d.political_stability, 'top_country': d.top_country});
		(!isNaN(d.gov_effectiveness)) && metricsData.push({'country_name': d.country_name, 'metric': 'Government effectiveness', 'score': d.gov_effectiveness, 'top_country': d.top_country});
		(!isNaN(d.regulatory_quality)) && metricsData.push({'country_name': d.country_name, 'metric': 'Regulatory quality', 'score': d.regulatory_quality, 'top_country': d.top_country});
		(!isNaN(d.rule_of_law)) && metricsData.push({'country_name': d.country_name, 'metric': 'Rule of law', 'score': d.rule_of_law, 'top_country': d.top_country});
		(!isNaN(d.control_corruption)) && metricsData.push({'country_name': d.country_name, 'metric': 'Control of corruption', 'score': d.control_corruption, 'top_country': d.top_country});
		(!isNaN(d.judicial_effectiveness_score)) && metricsData.push({'country_name': d.country_name, 'metric': 'Judicial effectiveness', 'score': d.judicial_effectiveness_score, 'top_country': d.top_country});
		(!isNaN(d.government_integrity_score)) && metricsData.push({'country_name': d.country_name, 'metric': 'Government integrity', 'score': d.government_integrity_score, 'top_country': d.top_country});
		(!isNaN(d.property_rights_score)) && metricsData.push({'country_name': d.country_name, 'metric': 'Property rights', 'score': d.property_rights_score, 'top_country': d.top_country});
		(!isNaN(d.overall_economic_freedom_score)) && metricsData.push({'country_name': d.country_name, 'metric': 'Overall economic freedom', 'score': d.overall_economic_freedom_score, 'top_country': d.top_country});
		(!isNaN(d.financial_freedom_score)) && metricsData.push({'country_name': d.country_name, 'metric': 'Financial freedom', 'score': d.financial_freedom_score, 'top_country': d.top_country});
	});
	// console.log(metricsData);


	edScale.domain([0, d3.max(data, function(d) { return d.edu_expenditure_per_person; })]).nice();
	healthScale.domain([0, d3.max(data, function(d) { return d.health_expenditure_per_person; })]).nice();

	makeScatterPlot(data);
	makeBeeswarm(metricsData.filter(function(d) { return wbVars.indexOf(d.metric) > -1; }), "#stable_system1", wbVars, wbScale);
	makeBeeswarm(metricsData.filter(function(d) { return heritageVars.indexOf(d.metric) > -1; }), "#stable_system2", heritageVars, heritageScale);
});

function makeScatterPlot(data) {
	var svg = d3.select("#health_ed_plot")
		.append("svg")
		.attr("width", width + margin["left"] + margin["right"])
		.attr("height", height + margin["top"] + margin["bottom"])
		// .attr("transform-origin", "top left")
		.attr("transform", "rotate(-46)")
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
		.style("fill", function(d) { return colorScale(d.top_country); })
		.on("mouseover", function(d) { showTooltip(d); })
		.on("mouseout", hideTooltip);
}

function makeBeeswarm(data, divId, vars, xScale) {
	systemMetricsScale.domain(vars);

	var svg = d3.select(divId)
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
		.attr("y", 60)
		.attr("fill", "#000")
		.text("Better");

	svg.append("text")
		.attr("class", "metricLabel")
		.attr("x", -beeMargin["left"])
		.attr("y", height - 10)
		.attr("fill", "#000")
		.text("Worse");

	var simulation = d3.forceSimulation(data)
		.force("x", d3.forceX(function(d) { return systemMetricsScale(d.metric); }).strength(0.2))
		.force("y", d3.forceY(function(d) { return xScale(d.score); }).strength(1))
		.force("collide", d3.forceCollide(4))
		.stop();

	for(var i = 0; i < 200; ++i) simulation.tick();

	var countries = svg.selectAll(".country")
		.data(data)
		.enter()
		.append("circle")
		.attr("class", "country")
		.attr("r", 4)
		.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; })
		.style("fill", function(d) { return colorScale(d.top_country); });
}

function showTooltip(d) {
	d3.select("#health_ed_plot .tooltip .country_name").text(d.country_name);
	d3.select("#health_ed_plot .tooltip .health_spending").text(COMMAFMT(d.health_expenditure_per_person));
	d3.select("#health_ed_plot .tooltip .edu_spending").text(COMMAFMT(d.edu_expenditure_per_person));
	d3.select("#health_ed_plot .tooltip").classed("hidden", false);
}

function hideTooltip() {
	d3.select("#health_ed_plot .tooltip").classed("hidden", true);
}