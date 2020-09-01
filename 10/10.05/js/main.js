/*
*    main.js
*    Mastering Data Visualization with D3.js
*    10.5 - Handling events across objects
*/

// global variables
let lineChart
let donutChart1
let donutChart2
let filteredData = {}
let donutData = []
const color = d3.scaleOrdinal(d3.schemePastel1)

// time parsers/formatters
const parseTime = d3.timeParse("%d/%m/%Y")
const formatTime = d3.timeFormat("%d/%m/%Y")

// event listeners
$("#coin-select").on("change", updateCharts)
$("#var-select").on("change", updateCharts)

// add jQuery UI slider
$("#date-slider").slider({
	range: true,
	max: parseTime("31/10/2017").getTime(),
	min: parseTime("12/5/2013").getTime(),
	step: 86400000, // one day
	values: [
		parseTime("12/5/2013").getTime(),
		parseTime("31/10/2017").getTime()
	],
	slide: (event, ui) => {
		$("#dateLabel1").text(formatTime(new Date(ui.values[0])))
		$("#dateLabel2").text(formatTime(new Date(ui.values[1])))
		updateCharts()
	}
})

d3.json("data/coins.json").then(data => {
	// prepare and clean data
	Object.keys(data).forEach(coin => {
		filteredData[coin] = data[coin]
			.filter(d => {
				return !(d["price_usd"] == null)
			}).map(d => {
				d["price_usd"] = Number(d["price_usd"])
				d["24h_vol"] = Number(d["24h_vol"])
				d["market_cap"] = Number(d["market_cap"])
				d["date"] = parseTime(d["date"])
				return d
			})
		donutData.push({
			"coin": coin,
			"data": filteredData[coin].slice(-1)[0]
		})
	})

	lineChart = new LineChart("#line-area")
	donutChart1 = new DonutChart("#donut-area1", "24h_vol")
	donutChart2 = new DonutChart("#donut-area2", "market_cap")
})

function arcClicked(arc) {
	$("#coin-select").val(arc.data.coin)
	updateCharts()
}

function updateCharts(){
	lineChart.wrangleData()
	donutChart1.wrangleData()
	donutChart2.wrangleData()
}