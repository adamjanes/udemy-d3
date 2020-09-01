/*
*    main.js
*    Mastering Data Visualization with D3.js
*    10.4 - Converting our code to OOP
*/

let lineChart1
let lineChart2
let lineChart3
let lineChart4
let lineChart5

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
	filteredData = {}
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
	})

	lineChart1 = new LineChart("#chart-area1", "bitcoin")
	lineChart2 = new LineChart("#chart-area2", "ethereum")
	lineChart3 = new LineChart("#chart-area3", "bitcoin_cash")
	lineChart4 = new LineChart("#chart-area4", "litecoin")
	lineChart5 = new LineChart("#chart-area5", "ripple")
})

function updateCharts(){
	lineChart1.wrangleData()
	lineChart2.wrangleData()
	lineChart3.wrangleData()
	lineChart4.wrangleData()
	lineChart5.wrangleData()
}