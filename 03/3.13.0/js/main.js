/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 1 - Star Break Coffee
*/

var margin = {left:80, right:20, top:50, bottom:100 };

var width = 600 - margin.left -  margin.right,
	height = 400 - margin.top - margin.bottom;
	
var g = d3.select("#chart-area")
		.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
				.attr("transform", "translate(" + margin.left + 
					", " + margin.top + ")");
					
/* g.append("rect")
	.attr("id", "back")
	.attr("x", 0)
	.attr("y", 0)
	.attr("width", width)
	.attr("height", height)
	.attr("fill", "green")
	.attr("opacity", 0.5) */
	
// X Label
g.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Month");

// Y Label
g.append("text")
    .attr("y", -60)
    .attr("x", -(height / 2))
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Revenue");
	
d3.json("data/revenues.json").then(function(data){

		
	data.forEach(d => d.revenue = +d.revenue)
	data.forEach(d => d.profit = +d.profit);
	

	console.log(data)	
	
	var x = d3.scaleBand()
		.domain(data.map(d => d.month))
		.range([0, width])
		.padding(0.2);
	
	var y = d3.scaleLinear()
		.domain([0, d3.max(data, function(d){
            return d.revenue;
        })])
		.range([height, 0]);

	var xAxisCall = d3.axisBottom(x);
	g.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0," + height +")") 
		.call(xAxisCall)
		
	var yAxisCall = d3.axisLeft(y)
		.ticks(5)
        .tickFormat(d =>  d + "$");
	g.append("g")
		.attr("clas", "y-axis")
		.call(yAxisCall);


	var rects = g.selectAll("rect")
		.data(data)
		
    rects.enter()
        .append("rect")
            .attr("y", function(d){ return y(d.revenue); })
            .attr("x", function(d){ return x(d.month); })
            .attr("width", x.bandwidth)
            .attr("height", function(d){ return height - y(d.revenue); })
            .attr("fill", "grey");
	
	})
	