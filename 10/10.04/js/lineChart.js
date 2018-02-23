/*
*    main.js
*    Mastering Data Visualization with D3.js
*    10.4 - Converting our code to OOP
*/

LineChart = function(_parentElement, _coin){
    this.parentElement = _parentElement;
    this.coin = _coin

    this.initVis();
};

LineChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { left:50, right:20, top:50, bottom:20 };
    vis.height = 250 - vis.margin.top - vis.margin.bottom;
    vis.width = 300 - vis.margin.left - vis.margin.right;

    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + vis.margin.left + 
            ", " + vis.margin.top + ")");

    vis.t = function() { return d3.transition().duration(1000); }

    vis.bisectDate = d3.bisector(function(d) { return d.date; }).left;

    vis.linePath = vis.g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", "3px");

    vis.g.append("text")
        .attr("x", vis.width/2)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .text(vis.coin)

    vis.x = d3.scaleTime().range([0, vis.width]);
    vis.y = d3.scaleLinear().range([vis.height, 0]);

    vis.yAxisCall = d3.axisLeft()
    vis.xAxisCall = d3.axisBottom()
        .ticks(4);
    vis.xAxis = vis.g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height +")");
    vis.yAxis = vis.g.append("g")
        .attr("class", "y axis");

    vis.wrangleData();
};


LineChart.prototype.wrangleData = function(){
    var vis = this;

    vis.yVariable = $("#var-select").val()

    // Filter data based on selections
    vis.sliderValues = $("#date-slider").slider("values")
    vis.dataFiltered = filteredData[vis.coin].filter(function(d) {
        return ((d.date >= vis.sliderValues[0]) && (d.date <= vis.sliderValues[1]))
    })

    vis.updateVis();
};


LineChart.prototype.updateVis = function(){
    var vis = this;

    // Update scales
    vis.x.domain(d3.extent(vis.dataFiltered, function(d) { return d.date; }));
    vis.y.domain([d3.min(vis.dataFiltered, function(d) { return d[vis.yVariable]; }) / 1.005, 
        d3.max(vis.dataFiltered, function(d) { return d[vis.yVariable]; }) * 1.005]);

    // Fix for y-axis format values
    var formatSi = d3.format(".2s");
    function formatAbbreviation(x) {
      var s = formatSi(x);
      switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "k": return s.slice(0, -1) + "K";
      }
      return s;
    }

    // Update axes
    vis.xAxisCall.scale(vis.x);
    vis.xAxis.transition(vis.t()).call(vis.xAxisCall);
    vis.yAxisCall.scale(vis.y);
    vis.yAxis.transition(vis.t()).call(vis.yAxisCall.tickFormat(formatAbbreviation));

    // Discard old tooltip elements
    d3.select(".focus."+vis.coin).remove();
    d3.select(".overlay."+vis.coin).remove();

    var focus = vis.g.append("g")
        .attr("class", "focus " + vis.coin)
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", vis.height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", vis.width);

    focus.append("circle")
        .attr("r", 5);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    vis.svg.append("rect")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
        .attr("class", "overlay " + vis.coin)
        .attr("width", vis.width)
        .attr("height", vis.height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = vis.x.invert(d3.mouse(this)[0]),
            i = vis.bisectDate(vis.dataFiltered, x0, 1),
            d0 = vis.dataFiltered[i - 1],
            d1 = vis.dataFiltered[i],
            d = (d1 && d0) ? (x0 - d0.date > d1.date - x0 ? d1 : d0) : 0;
        focus.attr("transform", "translate(" + vis.x(d.date) + "," + vis.y(d[vis.yVariable]) + ")");
        focus.select("text").text(function() { return d3.format("$,")(d[vis.yVariable].toFixed(2)); });
        focus.select(".x-hover-line").attr("y2", vis.height - vis.y(d[vis.yVariable]));
        focus.select(".y-hover-line").attr("x2", -vis.x(d.date));
    }

    var line = d3.line()
        .x(function(d) { return vis.x(d.date); })
        .y(function(d) { return vis.y(d[vis.yVariable]); });

    vis.g.select(".line")
        .transition(vis.t)
        .attr("d", line(vis.dataFiltered));

};
