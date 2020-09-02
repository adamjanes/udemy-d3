/*
*    main.js
*    Mastering Data Visualization with D3.js
*    10.6 - D3 Brushes
*/

// global variables
let lineChart
let donutChart1
let donutChart2
let timeline
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
		const dates = ui.values.map(val => new Date(val))
		const xVals = dates.map(date => timeline.x(date))

		timeline.brushComponent.call(timeline.brush.move, xVals)
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
	timeline = new Timeline("#timeline-area")
})

function brushed() {
	const selection = d3.event.selection || timeline.x.range()
	const newValues = selection.map(timeline.x.invert)

	$("#date-slider")
		.slider('values', 0, newValues[0])
		.slider('values', 1, newValues[1])
	$("#dateLabel1").text(formatTime(newValues[0]))
	$("#dateLabel2").text(formatTime(newValues[1]))

	lineChart.wrangleData()
}

function arcClicked(arc) {
	$("#coin-select").val(arc.data.coin)
	updateCharts()
}

function updateCharts(){
	lineChart.wrangleData()
	donutChart1.wrangleData()
	donutChart2.wrangleData()
	timeline.wrangleData()
}