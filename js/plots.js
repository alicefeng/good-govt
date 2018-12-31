var margin = {top:20, right: 20, bottom: 20, left: 40},
	width = 500,
	height = 500;

var edScale = d3.scaleLinear().range([0, width]);
var healthScale = d3.scaleLinear().range([height, 0]);
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

	console.log(data);
	edScale.domain([0, d3.max(data, function(d) { return d.edu_expenditure_per_person; })]).nice();
	healthScale.domain([0, d3.max(data, function(d) { return d.health_expenditure_per_person; })]).nice();
	makeScatterPlot(data);
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