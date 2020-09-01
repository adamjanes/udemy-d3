/*
*    timeline.js
*    Mastering Data Visualization with D3.js
*    10.6 - D3 Brushes
*/

class Timeline {
	constructor(_parentElement) {
		this.parentElement = _parentElement

		this.initVis()
	}

	initVis() {
    const vis = this

		vis.MARGIN = { LEFT: 80, RIGHT: 100, TOP: 0, BOTTOM: 30 }
		vis.WIDTH = 800 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT
		vis.HEIGHT = 130 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM
		
		vis.svg = d3.select(vis.parentElement).append("svg")
			.attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
			.attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)
		
		vis.g = vis.svg.append("g")
			.attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`)
		
		// scales
		vis.x = d3.scaleTime().range([0, vis.WIDTH])
		vis.y = d3.scaleLinear().range([vis.HEIGHT, 0])
		
		// x-axis
		vis.xAxisCall = d3.axisBottom()
			.ticks(4)
		vis.xAxis = vis.g.append("g")
			.attr("class", "x axis")
			.attr("transform", `translate(0, ${vis.HEIGHT})`)
        
    vis.areaPath = vis.g.append("path")
			.attr("fill", "#ccc")
		
		// initialize brush component
		vis.brush = d3.brushX()
      .handleSize(10)
			.extent([[0, 0], [vis.WIDTH, vis.HEIGHT]])
			.on("brush", brushed)

		// append brush component
		vis.brushComponent = vis.g.append("g")
			.attr("class", "brush")
			.call(vis.brush)

		vis.wrangleData()
	}

	wrangleData() {
		const vis = this

    vis.coin = $("#coin-select").val()
    vis.yValue = $("#var-select").val()
    vis.data = filteredData[vis.coin]

		vis.updateVis()
	}

	updateVis() {
    const vis = this

		vis.t = d3.transition().duration(1000)

    // update scales
		vis.x.domain(d3.extent(vis.data, d => d.date))
		vis.y.domain([0, d3.max(vis.data, d => d[vis.yValue]) * 1.005])
	
		// update axes
		vis.xAxisCall.scale(vis.x)
		vis.xAxis.transition(vis.t).call(vis.xAxisCall)
  
    // area path generator
    vis.area = d3.area()
      .x(d => vis.x(d.date))
      .y0(vis.HEIGHT)
      .y1(d => vis.y(d[vis.yValue]))

    vis.areaPath
      .data([vis.data])
      .attr("d", vis.area)
	}
}

