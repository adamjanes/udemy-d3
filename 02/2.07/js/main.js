/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.7 - Loading external data
*/

var svg = d3.select("#chart-area").append("svg")
    .attr("width", 400)
    .attr("height", 400);

d3.json("data/ages.json", function(error, data){
    if (error) throw error;

    data.forEach(function(d){
        d.age = +d.age;
    })

    var circles = svg.selectAll("circle")
        .data(data);

    circles.enter()
        .append("circle")
            .attr("cx", function(d, i){
                return (i * 50) + 25;
            })
            .attr("cy", 25)
            .attr("r", function(d){
                return d.age * 2;
            })
            .attr("fill", function(d){
                if (d.name == "Tony") {
                    return "blue";
                }
                else {
                    return "red";
                }
            });
});

