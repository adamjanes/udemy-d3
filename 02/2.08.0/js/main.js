/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.8 - Activity: Your first visualization!
*/

d3.json("data/buildings.json").then(function(data){
	console.log(data)
	
	data.forEach(function(d){
		d.height = +d.height;
	});
	
	var svg = d3.select("#chart-area").append("svg")
					.attr("width", 500)
					.attr("height", 500);
					
	var bars = svg.selectAll("bar")
		.data(data);
	
	bars.enter()
		.append("rect")
			.attr("height", function(d){
				return d.height
			})
			.attr("width", 50)
			.attr("x", function(d, i){
				return i*70 + 25
			})
			.attr("y", 20)
			.attr("fill", "grey");
}).catch(function(error){
	console.log(error);
})
;