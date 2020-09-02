/*
*    lineChart.js
*    Mastering Data Visualization with D3.js
*    10.6 - D3 Brushes
*/

class LineChart {
	// constructor function - make a new visualization object.
	constructor(_parentElement) {
		this.parentElement = _parentElement

		this.initVis()
	}

	// initVis method - set up static parts of our visualization.
	initVis() {
		const vis = this

		vis.MARGIN = { LEFT: 100, RIGHT: 100, TOP: 30, BOTTOM: 30 }
		vis.WIDTH = 800 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT
		vis.HEIGHT = 350 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM
		
		vis.svg = d3.select(vis.parentElement).append("svg")
			.attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
			.attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)
		
		vis.g = vis.svg.append("g")
			.attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`)
		
		// time parsers/formatters
		vis.parseTime = d3.timeParse("%d/%m/%Y")
		vis.formatTime = d3.timeFormat("%d/%m/%Y")
		// for tooltip
		vis.bisectDate = d3.bisector(d => d.date).left
		
		// add the line for the first time
		vis.g.append("path")
			.attr("class", "line")
			.attr("fill", "none")
			.attr("stroke", "grey")
			.attr("stroke-width", "3px")
		
		vis.yLabel = vis.g.append("text")
			.attr("class", "y axisLabel")
			.attr("transform", "rotate(-90)")
			.attr("y", -60)
			.attr("x", -170)
			.attr("font-size", "20px")
			.attr("text-anchor", "middle")
			.text("Price ($)")
		
		// scales
		vis.x = d3.scaleTime().range([0, vis.WIDTH])
		vis.y = d3.scaleLinear().range([vis.HEIGHT, 0])
		
		// axis generators
		vis.xAxisCall = d3.axisBottom()
			.ticks(5)
		vis.yAxisCall = d3.axisLeft()
			.ticks(6)
			.tickFormat(d => `${parseInt(d / 1000)}k`)
		
		// axis groups
		vis.xAxis = vis.g.append("g")
			.attr("class", "x axis")
			.attr("transform", `translate(0, ${vis.HEIGHT})`)
		vis.yAxis = vis.g.append("g")
			.attr("class", "y axis")
				
		vis.wrangleData()
	}

	// wrangleData method - selecting/filtering the data that we want to use.
	wrangleData() {
		const vis = this

		// filter data based on selections
		vis.coin = $("#coin-select").val()
		vis.yValue = $("#var-select").val()
		vis.sliderValues = $("#date-slider").slider("values")
		vis.dataTimeFiltered = filteredData[vis.coin].filter(d => {
			return ((d.date >= vis.sliderValues[0]) && (d.date <= vis.sliderValues[1]))
		})

		vis.updateVis()
	}

	// updateVis method - updating our elements to match the new data.
	updateVis() {
		const vis = this

		vis.t = d3.transition().duration(1000)

		// update scales
		vis.x.domain(d3.extent(vis.dataTimeFiltered, d => d.date))
		vis.y.domain([
			d3.min(vis.dataTimeFiltered, d => d[vis.yValue]) / 1.005, 
			d3.max(vis.dataTimeFiltered, d => d[vis.yValue]) * 1.005
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
		vis.xAxisCall.scale(vis.x)
		vis.xAxis.transition(vis.t).call(vis.xAxisCall)
		vis.yAxisCall.scale(vis.y)
		vis.yAxis.transition(vis.t).call(vis.yAxisCall.tickFormat(formatAbbreviation))
	
		// clear old tooltips
		vis.g.select(".focus").remove()
		vis.g.select(".overlay").remove()
	
		/******************************** Tooltip Code ********************************/
	
		vis.focus = vis.g.append("g")
			.attr("class", "focus")
			.style("display", "none")
	
		vis.focus.append("line")
			.attr("class", "x-hover-line hover-line")
			.attr("y1", 0)
			.attr("y2", vis.HEIGHT)
	
		vis.focus.append("line")
			.attr("class", "y-hover-line hover-line")
			.attr("x1", 0)
			.attr("x2", vis.WIDTH)
	
		vis.focus.append("circle")
			.attr("r", 7.5)
	
		vis.focus.append("text")
			.attr("x", 15)
			.attr("dy", ".31em")
	
		vis.g.append("rect")
			.attr("class", "overlay")
			.attr("width", vis.WIDTH)
			.attr("height", vis.HEIGHT)
			.on("mouseover", () => vis.focus.style("display", null))
			.on("mouseout", () => vis.focus.style("display", "none"))
			.on("mousemove", mousemove)
	
		function mousemove() {
			const x0 = vis.x.invert(d3.mouse(this)[0])
			const i = vis.bisectDate(vis.dataTimeFiltered, x0, 1)
			const d0 = vis.dataTimeFiltered[i - 1]
			const d1 = vis.dataTimeFiltered[i]
			const d = x0 - d0.date > d1.date - x0 ? d1 : d0
			vis.focus.attr("transform", `translate(${vis.x(d.date)}, ${vis.y(d[vis.yValue])})`)
			vis.focus.select("text").text(d[vis.yValue])
			vis.focus.select(".x-hover-line").attr("y2", vis.HEIGHT - vis.y(d[vis.yValue]))
			vis.focus.select(".y-hover-line").attr("x2", -vis.x(d.date))
		}
		
		/******************************** Tooltip Code ********************************/
	
		// Path generator
		vis.line = d3.line()
			.x(d => vis.x(d.date))
			.y(d => vis.y(d[vis.yValue]))
	
		// Update our line path
		vis.g.select(".line")
			.attr("stroke", color(vis.coin))
			.transition(vis.t)
			.attr("d", vis.line(vis.dataTimeFiltered))
	
		// Update y-axis label
		const newText = (vis.yValue === "price_usd") ? "Price ($)" 
			: (vis.yValue === "market_cap") ? "Market Capitalization ($)" 
				: "24 Hour Trading Volume ($)"
		vis.yLabel.text(newText)
	}
}

