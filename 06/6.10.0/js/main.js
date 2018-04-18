/*
*    main.js
*    Mastering Data Visualization with D3.js
*    CoinStats
*/
var filteredData;

var margin = { left:80, right:100, top:50, bottom:100 },
    height = 500 - margin.top - margin.bottom,
    width = 800 - margin.left - margin.right;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
        .attr("transform", "translate(" + margin.left +
            ", " + margin.top + ")");

// Time parser for x-scale
var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");
// For tooltip
var bisectDate = d3.bisector(function(d) { return d.date; }).left;

var t = function(){ return d3.transition().duration(1000); }

// Scales
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Axis generators
var xAxisCall = d3.axisBottom()
  //.ticks(4)
  .tickFormat(d3.timeFormat("%Y"));
var yAxisCall = d3.axisLeft()
    //.ticks(6)
    //.tickFormat(function(d) { return parseInt(d / 1000) + "k"; });

var formatNumber = d3.format('.2s');
var formatNumberFunction = function(num) {
  var newNum = formatNumber(num);
  return newNum;
}

// Axis groups
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
var yAxis = g.append("g")
    .attr("class", "y axis")

// Y-Axis label
yAxis.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "#5D6971")
    .text("Population)");

$('#coin-select').on('change', update);
$('#var-select').on('change', update);

d3.json("data/coins.json", function(error, data) {
    if (error) throw error;

    filteredData = {};
    // Data cleaning
    for (var coin in data) {
        if (!data.hasOwnProperty(coin)) {
            continue;
        }
        filteredData[coin] = data[coin].filter(function(d){
            return !(d["price_usd"] == null)
        })
        filteredData[coin].forEach(function(d){
            d["price_usd"] = +d["price_usd"];
            d["24h_vol"] = +d["24h_vol"];
            d["market_cap"] = +d["market_cap"];
            d["date"] = parseTime(d["date"])
        });
    }

    $("#date-slider").slider({
        range: true,
        min: parseTime("12/5/2013").getTime(),
        max: parseTime("31/10/2017").getTime(),
        values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
        step: (60 * 60 * 24),
        slide: function(event, ui) {
            update();
        }
    });

    update();
  });

  function update() {
    var coin = $('#coin-select').val(),
      type = $("#var-select").val();

    var sliderVals = $("#date-slider").slider("values");

    var minDate = d3.min(filteredData[coin], function(d){
        return d.date;
    })

    $("#date-slider").slider("option", "min", minDate.getTime());
    $("#date-slider").slider("option", "values", [sliderVals[0], sliderVals[1]]);

    $("#dateLabel1").text(formatTime(sliderVals[0]));
    $("#dateLabel2").text(formatTime(sliderVals[1]));

    var currentData = filteredData[coin].filter(function(d){
        return ((d.date > sliderVals[0]) && (d.date < sliderVals[1]))
    });

    x.domain(d3.extent(currentData, function(d) { return d.date }));
    y.domain(d3.extent(currentData, function(d) { return d[type]}));

    xAxisCall.scale(x);
    xAxis.transition(t()).call(xAxisCall);
    yAxisCall.scale(y);
    yAxis.transition(t()).call(yAxisCall.tickFormat(formatNumberFunction));

    // Line path generator
    var line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d[type]); });

    console.log(line)

    var path = g.selectAll('.line')
        .data([currentData])

    path.exit().remove()

    path
        .transition(t)
        .attr('d', line);

    path.enter().append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', '2px')
      .attr("id", function(d){
        console.log(d)
      })
      .attr('d', function(d){
        return line(d)
      });

        /******************************** Tooltip Code ********************************/

        var focus = g.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("line")
            .attr("class", "x-hover-line hover-line")
            .attr("y1", 0)
            .attr("y2", height);

        focus.append("line")
            .attr("class", "y-hover-line hover-line")
            .attr("x1", 0)
            .attr("x2", width);

        focus.append("circle")
            .attr("r", 7.5);

        focus.append("text")
            .attr("x", 15)
            .attr("dy", ".31em");

        g.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]),
                i = bisectDate(currentData, x0, 1),
                d0 = currentData[i - 1],
                d1 = currentData[i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            focus.attr("transform", "translate(" + x(d.date) + "," + y(d[type]) + ")");
            focus.select("text").text(d[type]);
            focus.select(".x-hover-line").attr("y2", height - y(d[type]));
            focus.select(".y-hover-line").attr("x2", -x(d.date));
        }


        /******************************** Tooltip Code ********************************/

  }





//});