d3.selectAll("li.country").on("mouseover", function() { highlightCountry(d3.select(this).node().textContent); });
d3.selectAll("li.country").on("mouseout", removeHighlight);


function highlightCountry(name) {
	d3.selectAll("li.country").classed("highlighted", false);
	d3.selectAll("li.superstar.country").classed("faded", true);

	var nameSlug = slugifyName(name);
	d3.selectAll("li.country." + nameSlug).classed("highlighted", true);
}

function removeHighlight() {
	d3.selectAll("li.superstar.country").classed("faded", false);
	d3.selectAll("li.country").classed("highlighted", false);
}

function slugifyName(name) {
	var name_array = name.split(" ");
	if(name_array.length === 1) {
		return name;
	}
	else {
		return name_array.join("_");
	}
}