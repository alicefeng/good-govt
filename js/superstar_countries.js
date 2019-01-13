d3.selectAll("li.country").on("mouseover", function() { highlightCountry(d3.select(this).node().textContent); });
d3.selectAll("li.country").on("mouseout", removeHighlight);


function highlightCountry(name) {
	d3.selectAll("li.country").classed("highlighted", false);
	d3.selectAll("li.superstar.country").classed("faded", true);

	name = name.indexOf("*") > -1 ? name.slice(0, name.length - 1): name;
	var nameSlug = slugifyName(name);
	d3.selectAll("li.country." + nameSlug).classed("highlighted", true);
	d3.selectAll("li.country." + nameSlug).classed("faded", false);
}

function removeHighlight() {
	d3.selectAll("li.superstar.country").classed("faded", false);
	d3.selectAll("li.country").classed("highlighted", false);
}

function slugifyName(name) {  // TODO: need to manually code some country names that create invalid slugs (Korea (Rep.), Antigua & Barbuda)
	var name_array = name.split(" ");
	if(name_array.length === 1) {
		return name;
	}
	else if(name === "Korea (Rep.)") {
		return "Korea";
	}
	else if(name === "Korea (Dem. People's Rep.)") {
		return "North_Korea";
	}
	else if(name === "Antigua & Barbuda") {
		return "Antigua_Barbuda";
	}
	else if(name === "Congo (Dem. Rep.)") {
		return "Congo_Dem_Rep";
	}
	else if(name === "Congo (Rep.)") {
		return "Congo_Rep";
	}
	else if(name === "Cote d'Ivoire") {
		return "Cote_dIvoire";
	}
	else {
		return name_array.join("_");
	}
}