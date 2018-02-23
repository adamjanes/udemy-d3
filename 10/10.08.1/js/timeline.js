/*
*    timeline.js
*    Mastering Data Visualization with D3.js
*    FreedomCorp Dashboard
*/

Timeline = function(_parentElement){
    this.parentElement = _parentElement;

    this.initVis();
};

Timeline.prototype.initVis = function(){
    var vis = this;

    vis.margin = {top: 0, right: 100, bottom: 20, left: 80};
    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 100 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

    vis.t = () => { return d3.transition().duration(1000); }

    vis.g = vis.svg.append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.x = d3.scaleTime()
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxisCall = d3.axisBottom()
        .ticks(4);

    vis.xAxis = vis.g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height +")");

    vis.areaPath = vis.g.append("path")
        .attr("fill", "#ccc");

    // Initialize brush component
    vis.brush = d3.brushX()
        .handleSize(10)
        .extent([[0, 0], [vis.width, vis.height]])
        .on("brush end", brushed)

    // Append brush component
    vis.brushComponent = vis.g.append("g")
        .attr("class", "brush")
        .call(vis.brush);

    vis.wrangleData();
};

Timeline.prototype.wrangleData = function(){
    var vis = this;

    vis.variable = "call_revenue"

    vis.dayNest = d3.nest()
        .key(function(d){ return formatTime(d.date); })
        .entries(calls)

    vis.dataFiltered = vis.dayNest
        .map(function(day){
            return {
                date: day.key,
                sum: day.values.reduce(function(accumulator, current){
                    return accumulator + current[vis.variable]
                }, 0)               
            }

        })

    vis.updateVis();
}

Timeline.prototype.updateVis = function(){
    var vis = this;

    vis.x.domain(d3.extent(vis.dataFiltered, (d) => { return parseTime(d.date); }));
    vis.y.domain([0, d3.max(vis.dataFiltered, (d) => d.sum) ])

    vis.xAxisCall.scale(vis.x)

    vis.xAxis.transition(vis.t()).call(vis.xAxisCall)

    vis.area0 = d3.area()
        .x((d) => { return vis.x(parseTime(d.date)); })
        .y0(vis.height)
        .y1(vis.height);

    vis.area = d3.area()
        .x((d) => { return vis.x(parseTime(d.date)); })
        .y0(vis.height)
        .y1((d) => { return vis.y(d.sum); })

    vis.areaPath
        .data([vis.dataFiltered])
        .attr("d", vis.area);
}