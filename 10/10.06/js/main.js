/*
*    main.js
*    Mastering Data Visualization with D3.js
*    10.6 - D3 Brushes
*/

// Global variables
var lineChart,
    donutChart1,
    donutChart2,
    timeline;
var filteredData = {};
var donutData = [];
var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");
var color = d3.scaleOrdinal(d3.schemeDark2);

// Event listeners
$("#coin-select").on("change", function() {
    coinChanged();
})
$("#var-select").on("change", function() { 
    lineChart.wrangleData();
    timeline.wrangleData();
})

// Add jQuery UI slider
$("#date-slider").slider({
    range: true,
    max: parseTime("31/10/2017").getTime(),
    min: parseTime("12/5/2013").getTime(),
    step: 86400000, // One day
    values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
    slide: function(event, ui){
        dates = ui.values.map(function(val) { return new Date(val); })
        xVals = dates.map(function(date) { return timeline.x(date); })

        timeline.brushComponent
            .call(timeline.brush.move, xVals)
    }
});

function arcClicked(arc){
    $("#coin-select").val(arc.data.coin);
    coinChanged();
}

function coinChanged(){
    donutChart1.wrangleData();
    donutChart2.wrangleData();
    lineChart.wrangleData();
    timeline.wrangleData();
}

function brushed() {
    var selection = d3.event.selection || timeline.x.range();
    var newValues = selection.map(timeline.x.invert)

    $("#date-slider")
        .slider('values', 0, newValues[0])
        .slider('values', 1, newValues[1]);
    $("#dateLabel1").text(formatTime(newValues[0]));
    $("#dateLabel2").text(formatTime(newValues[1]));
    lineChart.wrangleData();
}

d3.json("data/coins.json").then(function(data){
    // Prepare and clean data
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
        donutData.push({
            "coin": coin,
            "data": filteredData[coin].slice(-1)[0]
        })
    }

    lineChart = new LineChart("#line-area");

    donutChart1 = new DonutChart("#donut-area1", "24h_vol");
    donutChart2 = new DonutChart("#donut-area2", "market_cap");

    timeline = new Timeline("#timeline-area");

})