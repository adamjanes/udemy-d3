/*
*    main.js
*    Mastering Data Visualization with D3.js
*    10.2 - File Separation
*/

// time parsers/formatters
const parseTime = d3.timeParse("%d/%m/%Y")
const formatTime = d3.timeFormat("%d/%m/%Y")

// event listeners
$("#coin-select").on("change", update)
$("#var-select").on("change", update)

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
		update()
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

	// run the visualization for the first time
	update()
})

