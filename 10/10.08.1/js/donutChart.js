/*
*    donutChart.js
*    Mastering Data Visualization with D3.js
*    Project 4 - FreedomCorp Dashboard
*/

class DonutChart {
	constructor(_parentElement, _variable) {
		this.parentElement = _parentElement
		this.variable = _variable

		this.initVis()
	}

	initVis() {
    const vis = this

		vis.MARGIN = { LEFT: 40, RIGHT: 100, TOP: 40, BOTTOM: 10 }
		vis.WIDTH = 350 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT
    vis.HEIGHT = 140 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM
    vis.RADIUS = Math.min(vis.WIDTH, vis.HEIGHT) / 2
		
		vis.svg = d3.select(vis.parentElement).append("svg")
			.attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
			.attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)
		
		vis.g = vis.svg.append("g")
      .attr("transform", `translate(${vis.MARGIN.LEFT + (vis.WIDTH / 2)},
        ${vis.MARGIN.TOP + (vis.HEIGHT / 2)})`)
    
    vis.pie = d3.pie()
      .padAngle(0.03)
      .value(d => d.count)
      .sort(null)
    
    vis.arc = d3.arc()
      .innerRadius(vis.RADIUS - 15)
      .outerRadius(vis.RADIUS)

    vis.g.append("text")
      .attr("y", -60)
      .attr("x", -140)
      .attr("font-size", "12px")
      .attr("text-anchor", "start")
      .text("Company size")

    vis.color = d3.scaleOrdinal(d3.schemeAccent)
    vis.addLegend()

		vis.wrangleData()
	}

	wrangleData() {
		const vis = this

    const sizeNest = d3.nest()
      .key(d => d.company_size)
      .entries(calls)
    vis.dataFiltered = sizeNest.map(size => {
      return {
        value: size.key,
        count: size.values.length
      }
    })

		vis.updateVis()
	}

	updateVis() {
    const vis = this

    vis.t = d3.transition().duration(750)

    vis.path = vis.g.selectAll("path")
      .data(vis.pie(vis.dataFiltered))
    
    vis.path.transition(vis.t)
      .attrTween("d", arcTween)
  
    vis.path.enter().append("path")
      .attr("fill", d => vis.color(d.data.value))
      .transition(vis.t)
        .attrTween("d", arcTween)
  
    function arcTween(d) {
      const i = d3.interpolate(this._current, d)
      this._current = i(1)
      return (t) => vis.arc(i(t))
    }
  }

  addLegend() {
	  const vis = this

    const legend = vis.g.append("g")
      .attr("transform", "translate(150, -30)")

    const legendArray = [
    	{ label: "Small", color: vis.color("small") },
    	{ label: "Medium", color: vis.color("medium") },
    	{ label: "Large", color: vis.color("large") }
	  ]

    const legendRow = legend.selectAll(".legendRow")
      .data(legendArray)
      .enter().append("g")
        .attr("class", "legendRow")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        
    legendRow.append("rect")
      .attr("class", "legendRect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", d => d.color)

    legendRow.append("text")
      .attr("class", "legendText")
      .attr("x", -10)
      .attr("y", 10)
      .attr("text-anchor", "end")
      .text(d => d.label) 
  }
}
