/*
*    main.js
*    Mastering Data Visualization with D3.js
*    10.4 - Converting our code to OOP
*/

var filteredData;
var lineChart1,
    lineChart2,
    lineChart3,
    lineChart4,
    lineChart5;
var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");

// Event listeners
$("#coin-select").on("change", updateCharts)
$("#var-select").on("change", updateCharts)

// Add jQuery UI slider
$("#date-slider").slider({
    range: true,
    max: parseTime("31/10/2017").getTime(),
    min: parseTime("12/5/2013").getTime(),
    step: 86400000, // One day
    values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
    slide: function(event, ui){
        $("#dateLabel1").text(formatTime(new Date(ui.values[0])));
        $("#dateLabel2").text(formatTime(new Date(ui.values[1])));
        updateCharts();
    }
});

d3.json("data/coins.json").then(function(data){

    // Prepare and clean data
    filteredData = {};
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

    lineChart1 = new LineChart("#chart-area1", "bitcoin");
    lineChart2 = new LineChart("#chart-area2", "ethereum");
    lineChart3 = new LineChart("#chart-area3", "bitcoin_cash");
    lineChart4 = new LineChart("#chart-area4", "litecoin");
    lineChart5 = new LineChart("#chart-area5", "ripple");

})

function updateCharts(){
    lineChart1.wrangleData()
    lineChart2.wrangleData()
    lineChart3.wrangleData()
    lineChart4.wrangleData()
    lineChart5.wrangleData()
}