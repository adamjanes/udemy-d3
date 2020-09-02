/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 4 - FreedomCorp Dashboard
*/

// global variables
let allCalls
let calls
let nestedCalls
let donut
let revenueBar
let durationBar
let unitBar
let stackedArea
let timeline

const parseTime = d3.timeParse("%d/%m/%Y")
const formatTime = d3.timeFormat("%d/%m/%Y")

d3.json("data/calls.json").then(data => {    
	data.forEach(d => {
		d.call_revenue = Number(d.call_revenue)
		d.units_sold = Number(d.units_sold)
		d.call_duration = Number(d.call_duration)
		d.date = parseTime(d.date)
	})

	allCalls = data
	calls = data

	nestedCalls = d3.nest()
		.key(d => d.category)
		.entries(calls)

	donut = new DonutChart("#company-size")
	revenueBar = new BarChart("#revenue", "call_revenue", "Average call revenue (USD)")
	durationBar = new BarChart("#call-duration", "call_duration", "Average call duration (seconds)")
	unitBar = new BarChart("#units-sold", "units_sold", "Units sold per call")
  stackedArea = new StackedAreaChart("#stacked-area")
	timeline = new Timeline("#timeline")
})

$("#var-select").on("change", () => {
	stackedArea.wrangleData()
	timeline.wrangleData()
})

function brushed() {
	const selection = d3.event.selection || timeline.x.range()
	const newValues = selection.map(timeline.x.invert)
	changeDates(newValues)
}

function changeDates(values) {
	calls = allCalls.filter(d => ((d.date > values[0]) && (d.date < values[1])))

	nestedCalls = d3.nest()
		.key(d => d.category)
		.entries(calls)

	$("#dateLabel1").text(formatTime(values[0]))
	$("#dateLabel2").text(formatTime(values[1]))

	donut.wrangleData()
	revenueBar.wrangleData()
	unitBar.wrangleData()
	durationBar.wrangleData()
	stackedArea.wrangleData()
}