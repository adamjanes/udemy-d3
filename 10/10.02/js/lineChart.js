/*
*    lineChart.js
*    Mastering Data Visualization with D3.js
*    10.2 - File Separation
*/

const MARGIN = { LEFT: 100, RIGHT: 100, TOP: 50, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// time parsers/formatters
const parseTime = d3.timeParse("%d/%m/%Y")
const formatTime = d3.timeFormat("%d/%m/%Y")
// for tooltip
const bisectDate = d3.bisector(d => d.date).left

// add the line for the first time
g.append("path")
	.attr("class", "line")
	.attr("fill", "none")
	.attr("stroke", "grey")
	.attr("stroke-width", "3px")

// axis labels
const xLabel = g.append("text")
	.attr("class", "x axisLabel")
	.attr("y", HEIGHT + 50)
	.attr("x", WIDTH / 2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Time")
const yLabel = g.append("text")
	.attr("class", "y axisLabel")
	.attr("transform", "rotate(-90)")
	.attr("y", -60)
	.attr("x", -170)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Price ($)")

// scales
const x = d3.scaleTime().range([0, WIDTH])
const y = d3.scaleLinear().range([HEIGHT, 0])

// axis generators
const xAxisCall = d3.axisBottom()
const yAxisCall = d3.axisLeft()
	.ticks(6)
	.tickFormat(d => `${parseInt(d / 1000)}k`)

// axis groups
const xAxis = g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
const yAxis = g.append("g")
	.attr("class", "y axis")


function update() {
	const t = d3.transition().duration(1000)

	// filter data based on selections
	const coin = $("#coin-select").val()
	const yValue = $("#var-select").val()
	const sliderValues = $("#date-slider").slider("values")
	const dataTimeFiltered = filteredData[coin].filter(d => {
		return ((d.date >= sliderValues[0]) && (d.date <= sliderValues[1]))
	})

	// update scales
	x.domain(d3.extent(dataTimeFiltered, d => d.date))
	y.domain([
		d3.min(dataTimeFiltered, d => d[yValue]) / 1.005, 
		d3.max(dataTimeFiltered, d => d[yValue]) * 1.005
	])

	// fix for format values
	const formatSi = d3.format(".2s")
	function formatAbbreviation(x) {
		const s = formatSi(x)
		switch (s[s.length - 1]) {
			case "G": return s.slice(0, -1) + "B" // billions
			case "k": return s.slice(0, -1) + "K" // thousands
		}
		return s
	}

	// update axes
	xAxisCall.scale(x)
	xAxis.transition(t).call(xAxisCall)
	yAxisCall.scale(y)
	yAxis.transition(t).call(yAxisCall.tickFormat(formatAbbreviation))

	// clear old tooltips
	d3.select(".focus").remove()
	d3.select(".overlay").remove()

	/******************************** Tooltip Code ********************************/

	const focus = g.append("g")
		.attr("class", "focus")
		.style("display", "none")

	focus.append("line")
		.attr("class", "x-hover-line hover-line")
		.attr("y1", 0)
		.attr("y2", HEIGHT)

	focus.append("line")
		.attr("class", "y-hover-line hover-line")
		.attr("x1", 0)
		.attr("x2", WIDTH)

	focus.append("circle")
		.attr("r", 7.5)

	focus.append("text")
		.attr("x", 15)
		.attr("dy", ".31em")

	g.append("rect")
		.attr("class", "overlay")
		.attr("width", WIDTH)
		.attr("height", HEIGHT)
		.on("mouseover", () => focus.style("display", null))
		.on("mouseout", () => focus.style("display", "none"))
		.on("mousemove", mousemove)

	function mousemove() {
		const x0 = x.invert(d3.mouse(this)[0])
		const i = bisectDate(dataTimeFiltered, x0, 1)
		const d0 = dataTimeFiltered[i - 1]
		const d1 = dataTimeFiltered[i]
		const d = x0 - d0.date > d1.date - x0 ? d1 : d0
		focus.attr("transform", `translate(${x(d.date)}, ${y(d[yValue])})`)
		focus.select("text").text(d[yValue])
		focus.select(".x-hover-line").attr("y2", HEIGHT - y(d[yValue]))
		focus.select(".y-hover-line").attr("x2", -x(d.date))
	}
	
	/******************************** Tooltip Code ********************************/

	// Path generator
	line = d3.line()
		.x(d => x(d.date))
		.y(d => y(d[yValue]))

	// Update our line path
	g.select(".line")
		.transition(t)
		.attr("d", line(dataTimeFiltered))

	// Update y-axis label
	const newText = (yValue === "price_usd") ? "Price ($)" 
		: (yValue === "market_cap") ? "Market Capitalization ($)" 
			: "24 Hour Trading Volume ($)"
	yLabel.text(newText)
}

