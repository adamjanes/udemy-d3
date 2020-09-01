/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.5 - Activity: Adding SVGs to the screen
*/

var svg = d3.select("#chart-area").append("svg")
				.attr("width", 500)
				.attr("height", 400)
				
var rect = svg.append("rect")
				.attr("x", 100)
				.attr("y", 100)
				.attr("width", 100)
				.attr("height", 100)
				.attr("fill", "blue")
				
var rect = svg.append("rect")
				.attr("x", 150)
				.attr("y", 150)
				.attr("width", 100)
				.attr("height", 100)
				.attr("fill", "red")
				
rect
	.attr("stroke", "black")
	.attr("opacity", 0.5)